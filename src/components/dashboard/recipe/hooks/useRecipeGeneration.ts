import { useState } from "react";
import { Recipe, RecipeFilters, ChildProfile } from "../../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useRecipeError } from './useRecipeError';

export const useRecipeGeneration = () => {
  const [loading, setLoading] = useState(false);
  const { error, handleError } = useRecipeError();

  const generateRecipes = async (child: ChildProfile, filters: RecipeFilters) => {
    if (!child.name || !child.birth_date) {
      throw new Error("Les informations de l'enfant sont incomplètes");
    }

    try {
      setLoading(true);
      console.log("Generating recipes for child:", child);
      console.log("Using filters:", filters);

      const { data: response, error: generateError } = await supabase.functions.invoke(
        'generate-recipe',
        {
          body: { 
            child: {
              id: child.id,
              name: child.name,
              birth_date: child.birth_date,
              allergies: child.allergies || [],
              preferences: child.preferences || [],
              profile_id: child.profile_id
            },
            filters
          }
        }
      );

      if (generateError) throw generateError;
      console.log("Generated recipe response:", response);

      if (!response?.recipes || !Array.isArray(response.recipes)) {
        throw new Error("Format de réponse invalide");
      }

      const savedRecipes: Recipe[] = [];

      for (const recipe of response.recipes) {
        try {
          console.log("Processing recipe:", recipe);

          // Ensure all JSON fields are properly stringified before saving
          const ingredients = Array.isArray(recipe.ingredients) 
            ? recipe.ingredients 
            : typeof recipe.ingredients === 'string'
              ? JSON.parse(recipe.ingredients)
              : [];

          const instructions = Array.isArray(recipe.instructions)
            ? recipe.instructions
            : typeof recipe.instructions === 'string'
              ? recipe.instructions.split('\n')
              : [];

          const healthBenefits = Array.isArray(recipe.health_benefits)
            ? recipe.health_benefits
            : typeof recipe.health_benefits === 'string'
              ? JSON.parse(recipe.health_benefits)
              : [];

          const cookingSteps = Array.isArray(recipe.cooking_steps)
            ? recipe.cooking_steps
            : typeof recipe.cooking_steps === 'string'
              ? JSON.parse(recipe.cooking_steps)
              : [];

          const nutritionalInfo = typeof recipe.nutritional_info === 'object'
            ? recipe.nutritional_info
            : typeof recipe.nutritional_info === 'string'
              ? JSON.parse(recipe.nutritional_info)
              : { calories: 0, protein: 0, carbs: 0, fat: 0 };

          const recipeData = {
            profile_id: child.profile_id,
            child_id: child.id,
            name: String(recipe.name),
            ingredients: JSON.stringify(ingredients),
            instructions: Array.isArray(instructions) ? instructions.join('\n') : instructions,
            nutritional_info: JSON.stringify(nutritionalInfo),
            meal_type: recipe.meal_type,
            preparation_time: Number(recipe.preparation_time) || 30,
            max_prep_time: Number(filters.maxPrepTime) || 30,
            difficulty: recipe.difficulty,
            servings: Number(recipe.servings) || 4,
            auto_generated: true,
            source: 'ia',
            health_benefits: JSON.stringify(healthBenefits),
            image_url: String(recipe.image_url || 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9'),
            min_age: Number(recipe.min_age) || 0,
            max_age: Number(recipe.max_age) || 18,
            dietary_preferences: recipe.dietary_preferences || [],
            allergens: recipe.allergens || [],
            cost_estimate: Number(recipe.cost_estimate) || 0,
            seasonal_months: recipe.seasonal_months || [1,2,3,4,5,6,7,8,9,10,11,12],
            cooking_steps: JSON.stringify(cookingSteps),
            is_generated: true
          };

          console.log("Saving recipe with data:", recipeData);

          const { data: savedRecipe, error: saveError } = await supabase
            .from('recipes')
            .insert(recipeData)
            .select()
            .single();

          if (saveError) throw saveError;

          if (savedRecipe) {
            savedRecipes.push(savedRecipe as Recipe);
          }
        } catch (error) {
          console.error('Error processing recipe:', recipe.name, error);
          continue;
        }
      }

      if (savedRecipes.length === 0) {
        throw new Error("Aucune recette n'a pu être sauvegardée");
      }

      toast.success(`${savedRecipes.length} nouvelles recettes ont été générées !`);
      return savedRecipes;

    } catch (err) {
      return handleError(err, "Une erreur est survenue lors de la génération des recettes");
    } finally {
      setLoading(false);
    }
  };

  return {
    generateRecipes,
    loading,
    error
  };
};