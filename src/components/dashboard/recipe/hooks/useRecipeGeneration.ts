import { useState } from "react";
import { Recipe, RecipeFilters, ChildProfile, MealType, Difficulty } from "../../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

// Helper function to validate meal type
const validateMealType = (type: string): MealType => {
  const validTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];
  return validTypes.includes(type as MealType) ? type as MealType : 'dinner';
};

// Helper function to validate difficulty
const validateDifficulty = (level: string): Difficulty => {
  const validLevels: Difficulty[] = ['easy', 'medium', 'hard'];
  return validLevels.includes(level as Difficulty) ? level as Difficulty : 'medium';
};

// Helper function to safely parse JSON
const safeParseJson = (value: Json | null): any => {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
};

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

      if (!response.recipes || !Array.isArray(response.recipes)) {
        throw new Error("Format de réponse invalide");
      }

      const savedRecipes: Recipe[] = [];

      for (const recipe of response.recipes) {
        try {
          const recipeData = {
            profile_id: child.profile_id,
            child_id: child.id,
            name: String(recipe.name),
            ingredients: JSON.stringify(recipe.ingredients),
            instructions: Array.isArray(recipe.instructions) 
              ? recipe.instructions.map(String)
              : [String(recipe.instructions)],
            nutritional_info: JSON.stringify(recipe.nutritional_info),
            meal_type: validateMealType(recipe.meal_type),
            preparation_time: Number(recipe.preparation_time) || 30,
            max_prep_time: Number(filters.maxPrepTime) || 30,
            difficulty: validateDifficulty(recipe.difficulty),
            servings: Number(recipe.servings) || 4,
            auto_generated: true,
            source: 'ia',
            health_benefits: JSON.stringify(recipe.health_benefits || []),
            cooking_steps: JSON.stringify(recipe.cooking_steps || []),
            image_url: String(recipe.image_url || 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9'),
            min_age: Number(recipe.min_age) || 0,
            max_age: Number(recipe.max_age) || 18,
            dietary_preferences: Array.isArray(recipe.dietary_preferences) 
              ? recipe.dietary_preferences.map(String)
              : [],
            allergens: Array.isArray(recipe.allergens) 
              ? recipe.allergens.map(String)
              : [],
            cost_estimate: Number(recipe.cost_estimate) || 0,
            seasonal_months: Array.isArray(recipe.seasonal_months) 
              ? recipe.seasonal_months.map(Number)
              : [1,2,3,4,5,6,7,8,9,10,11,12],
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
              ingredients: safeParseJson(savedRecipe.ingredients),
              nutritional_info: safeParseJson(savedRecipe.nutritional_info),
              instructions: Array.isArray(savedRecipe.instructions)
                ? savedRecipe.instructions
                : [String(savedRecipe.instructions)],
              health_benefits: safeParseJson(savedRecipe.health_benefits),
              cooking_steps: safeParseJson(savedRecipe.cooking_steps),
              meal_type: validateMealType(savedRecipe.meal_type),
              difficulty: validateDifficulty(savedRecipe.difficulty),
              allergens: savedRecipe.allergens || [],
              dietary_preferences: savedRecipe.dietary_preferences || [],
              seasonal_months: savedRecipe.seasonal_months || [1,2,3,4,5,6,7,8,9,10,11,12]
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