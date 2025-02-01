import { useState } from "react";
import { Recipe, RecipeFilters, ChildProfile, MealType, Difficulty } from "../../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { validateMealType, validateDifficulty } from "../utils/validationUtils";

export const useRecipeGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateRecipes = async (child: ChildProfile, filters: RecipeFilters) => {
    if (!child.name || !child.birth_date) {
      throw new Error("Les informations de l'enfant sont incomplètes");
    }

    try {
      setLoading(true);
      setError(null);

      console.log("Generating recipes for child:", child);
      console.log("Using filters:", filters);

      // First check for existing recipes
      const { data: existingRecipes, error: fetchError } = await supabase
        .from('recipes')
        .select('*')
        .eq('profile_id', child.profile_id)
        .eq('child_id', child.id);

      if (fetchError) throw fetchError;

      console.log("Existing recipes:", existingRecipes);

      // Generate new recipes if none exist or force regeneration
      const { data: response, error: generateError } = await supabase.functions.invoke(
        'generate-recipe',
        {
          body: { 
            child: {
              id: child.id,
              name: child.name,
              birth_date: child.birth_date,
              allergies: child.allergies || [],
              preferences: child.preferences || []
            },
            filters,
            existingRecipes: existingRecipes || []
          }
        }
      );

      if (generateError) throw generateError;
      console.log("Generated recipe response:", response);

      if (!response.recipes || !Array.isArray(response.recipes)) {
        throw new Error("Format de réponse invalide");
      }

      const savedRecipes: Recipe[] = [];

      // Save each recipe
      for (const recipe of response.recipes) {
        try {
          const mealType = validateMealType(filters.mealType !== 'all' ? filters.mealType : 'dinner');
          const difficulty = validateDifficulty(filters.difficulty !== 'all' ? filters.difficulty : 'medium');

          // Ensure all JSON fields are properly formatted
          const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
          const nutritionalInfo = recipe.nutritional_info || {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0
          };
          const healthBenefits = Array.isArray(recipe.health_benefits) ? recipe.health_benefits : [];
          const cookingSteps = Array.isArray(recipe.cooking_steps) ? recipe.cooking_steps : [];

          const recipeData = {
            profile_id: child.profile_id,
            child_id: child.id,
            name: recipe.name,
            ingredients: JSON.stringify(ingredients),
            instructions: Array.isArray(recipe.instructions) ? recipe.instructions.join('\n') : String(recipe.instructions),
            nutritional_info: JSON.stringify(nutritionalInfo),
            meal_type: mealType,
            preparation_time: Number(recipe.preparation_time) || 30,
            max_prep_time: Number(filters.maxPrepTime) || 30,
            difficulty: difficulty,
            servings: Number(recipe.servings) || 4,
            auto_generated: true,
            source: 'ia',
            health_benefits: JSON.stringify(healthBenefits),
            cooking_steps: JSON.stringify(cookingSteps),
            image_url: recipe.image_url || 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
            min_age: Number(recipe.min_age) || 0,
            max_age: Number(recipe.max_age) || 18,
            dietary_preferences: recipe.dietary_preferences || [],
            allergens: recipe.allergens || [],
            cost_estimate: Number(recipe.cost_estimate) || 0,
            seasonal_months: recipe.seasonal_months || [1,2,3,4,5,6,7,8,9,10,11,12],
            is_generated: true
          };

          console.log("Saving recipe:", recipeData);

          const { data: savedRecipe, error: saveError } = await supabase
            .from('recipes')
            .insert(recipeData)
            .select()
            .single();

          if (saveError) throw saveError;

          if (savedRecipe) {
            const parsedRecipe: Recipe = {
              ...savedRecipe,
              ingredients: JSON.parse(savedRecipe.ingredients as string),
              nutritional_info: JSON.parse(savedRecipe.nutritional_info as string),
              instructions: savedRecipe.instructions.split('\n'),
              health_benefits: savedRecipe.health_benefits ? 
                JSON.parse(savedRecipe.health_benefits as string) 
                : undefined,
              cooking_steps: savedRecipe.cooking_steps ? 
                JSON.parse(savedRecipe.cooking_steps as string) 
                : [],
              meal_type: validateMealType(savedRecipe.meal_type),
              difficulty: validateDifficulty(savedRecipe.difficulty)
            };
            savedRecipes.push(parsedRecipe);
          }
        } catch (error) {
          console.error('Error processing recipe:', recipe.name, error);
          continue;
        }
      }

      if (savedRecipes.length === 0) {
        throw new Error("Aucune recette n'a pu être sauvegardée");
      }

      return savedRecipes;

    } catch (err) {
      console.error("Error in recipe generation process:", err);
      const errorMessage = err instanceof Error ? err.message : "Une erreur est survenue";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
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