import { useState } from "react";
import { Recipe, RecipeFilters, ChildProfile, MealType, Difficulty } from "../../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GeneratedRecipe {
  name: string;
  ingredients: Array<{
    item: string;
    quantity: string;
    unit: string;
  }>;
  instructions: string[];
  nutritional_info: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  meal_type: string;
  preparation_time: number;
  difficulty: string;
  servings: number;
  image_url?: string;
  health_benefits?: any[];
  min_age?: number;
  max_age?: number;
  dietary_preferences?: string[];
  allergens?: string[];
  cost_estimate?: number;
  seasonal_months?: number[];
  cooking_steps?: any[];
}

const validateMealType = (type: string): MealType => {
  const validTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];
  return validTypes.includes(type as MealType) ? type as MealType : 'dinner';
};

const validateDifficulty = (level: string): Difficulty => {
  const validLevels: Difficulty[] = ['easy', 'medium', 'hard'];
  return validLevels.includes(level as Difficulty) ? level as Difficulty : 'medium';
};

const formatIngredients = (ingredients: any[]) => {
  return ingredients.map(ing => ({
    item: String(ing.item || ''),
    quantity: String(ing.quantity || ''),
    unit: String(ing.unit || '')
  }));
};

const transformToRecipe = (savedRecipe: any): Recipe => {
  return {
    ...savedRecipe,
    ingredients: typeof savedRecipe.ingredients === 'string' 
      ? JSON.parse(savedRecipe.ingredients)
      : savedRecipe.ingredients,
    instructions: Array.isArray(savedRecipe.instructions)
      ? savedRecipe.instructions
      : [savedRecipe.instructions].filter(Boolean).map(String),
    nutritional_info: typeof savedRecipe.nutritional_info === 'string'
      ? JSON.parse(savedRecipe.nutritional_info)
      : savedRecipe.nutritional_info,
    health_benefits: typeof savedRecipe.health_benefits === 'string'
      ? JSON.parse(savedRecipe.health_benefits)
      : savedRecipe.health_benefits || [],
    cooking_steps: typeof savedRecipe.cooking_steps === 'string'
      ? JSON.parse(savedRecipe.cooking_steps)
      : savedRecipe.cooking_steps || [],
    meal_type: validateMealType(savedRecipe.meal_type),
    difficulty: validateDifficulty(savedRecipe.difficulty)
  };
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

      // Récupérer les recettes existantes
      const { data: existingRecipes, error: fetchError } = await supabase
        .from('recipes')
        .select('*')
        .eq('profile_id', child.profile_id)
        .eq('is_generated', true);

      if (fetchError) throw fetchError;

      const { data: response, error: generateError } = await supabase.functions.invoke(
        'generate-recipe',
        {
          body: { 
            child: {
              ...child,
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

      // Supprimer les anciennes recettes générées
      const { error: deleteError } = await supabase
        .from('recipes')
        .delete()
        .eq('profile_id', child.profile_id)
        .eq('is_generated', true);

      if (deleteError) throw deleteError;

      const savedRecipes: Recipe[] = [];

      // Sauvegarder les nouvelles recettes
      for (const recipe of response.recipes as GeneratedRecipe[]) {
        try {
          const ingredients = Array.isArray(recipe.ingredients)
            ? formatIngredients(recipe.ingredients)
            : [];

          const recipeToInsert = {
            profile_id: child.profile_id,
            name: recipe.name,
            ingredients: JSON.stringify(ingredients),
            instructions: Array.isArray(recipe.instructions)
              ? recipe.instructions.map(String)
              : [String(recipe.instructions)],
            nutritional_info: JSON.stringify(recipe.nutritional_info),
            meal_type: validateMealType(recipe.meal_type),
            preparation_time: Number(recipe.preparation_time) || 30,
            difficulty: validateDifficulty(recipe.difficulty),
            servings: Number(recipe.servings) || 4,
            is_generated: true,
            image_url: recipe.image_url || 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
            health_benefits: JSON.stringify(recipe.health_benefits || []),
            min_age: Number(recipe.min_age) || 0,
            max_age: Number(recipe.max_age) || 18,
            dietary_preferences: recipe.dietary_preferences || [],
            allergens: recipe.allergens || [],
            cost_estimate: Number(recipe.cost_estimate) || 0,
            seasonal_months: recipe.seasonal_months || [1,2,3,4,5,6,7,8,9,10,11,12],
            cooking_steps: JSON.stringify(recipe.cooking_steps || [])
          };

          const { data: savedRecipe, error: saveError } = await supabase
            .from('recipes')
            .insert(recipeToInsert)
            .select('*')
            .single();

          if (saveError) throw saveError;

          const transformedRecipe = transformToRecipe(savedRecipe);
          savedRecipes.push(transformedRecipe);
          
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