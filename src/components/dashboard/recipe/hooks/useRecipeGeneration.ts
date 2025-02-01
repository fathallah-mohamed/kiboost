import { useState } from "react";
import { Recipe, RecipeFilters, ChildProfile } from "../../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { transformToRecipe } from '../utils/recipeTransformers';
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

          const recipeData = {
            profile_id: child.profile_id,
            child_id: child.id,
            name: String(recipe.name),
            ingredients: JSON.stringify(recipe.ingredients),
            instructions: JSON.stringify(recipe.instructions),
            nutritional_info: JSON.stringify(recipe.nutritional_info),
            meal_type: recipe.meal_type,
            preparation_time: Number(recipe.preparation_time) || 30,
            max_prep_time: Number(filters.maxPrepTime) || 30,
            difficulty: recipe.difficulty,
            servings: Number(recipe.servings) || 4,
            auto_generated: true,
            source: 'ia',
            health_benefits: JSON.stringify(recipe.health_benefits || []),
            image_url: String(recipe.image_url || 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9'),
            min_age: Number(recipe.min_age) || 0,
            max_age: Number(recipe.max_age) || 18,
            dietary_preferences: recipe.dietary_preferences || [],
            allergens: recipe.allergens || [],
            cost_estimate: Number(recipe.cost_estimate) || 0,
            seasonal_months: recipe.seasonal_months || [1,2,3,4,5,6,7,8,9,10,11,12],
            cooking_steps: JSON.stringify(recipe.cooking_steps || []),
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
            const typedRecipe = transformToRecipe(savedRecipe);
            savedRecipes.push(typedRecipe);
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