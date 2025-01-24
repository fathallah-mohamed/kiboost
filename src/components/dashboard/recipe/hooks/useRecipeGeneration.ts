import { useState } from "react";
import { Recipe, RecipeFilters, ChildProfile, MealType, Difficulty } from "../../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type ExtendedMealType = MealType | "all";
type ExtendedDifficulty = Difficulty | "all";

interface ExtendedFilters extends Omit<RecipeFilters, 'mealType' | 'difficulty'> {
  mealType?: ExtendedMealType;
  difficulty?: ExtendedDifficulty;
}

export const useRecipeGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateRecipes = async (child: ChildProfile, filters: ExtendedFilters) => {
    try {
      setLoading(true);
      setError(null);

      console.log("Generating recipes with filters:", filters);

      const { data: response, error: generateError } = await supabase.functions.invoke(
        'generate-recipe',
        {
          body: { 
            child: {
              ...child,
              profile_id: child.id
            },
            filters: {
              ...filters,
              mealType: filters.mealType === 'all' ? undefined : filters.mealType as MealType,
              difficulty: filters.difficulty === 'all' ? undefined : filters.difficulty as Difficulty
            }
          }
        }
      );

      if (generateError) throw generateError;

      // Récupérer aussi les recettes historiques qui correspondent aux filtres
      const { data: existingRecipes, error: fetchError } = await supabase
        .from('recipes')
        .select('*')
        .eq('is_generated', true)
        .eq(
          filters.mealType && filters.mealType !== 'all' ? 'meal_type' : 'is_generated', 
          filters.mealType && filters.mealType !== 'all' ? filters.mealType : true
        )
        .lte('preparation_time', filters.maxPrepTime || 120)
        .eq(
          filters.difficulty && filters.difficulty !== 'all' ? 'difficulty' : 'is_generated',
          filters.difficulty && filters.difficulty !== 'all' ? filters.difficulty : true
        );

      if (fetchError) throw fetchError;

      const parseJsonField = <T>(field: unknown, defaultValue: T): T => {
        if (typeof field === 'string') {
          try {
            return JSON.parse(field);
          } catch {
            return defaultValue;
          }
        }
        return field as T || defaultValue;
      };

      // Convertir les données en type Recipe
      const allRecipes = [...(response.recipes || []), ...(existingRecipes || [])].map(recipe => ({
        ...recipe,
        ingredients: parseJsonField(recipe.ingredients, []).map((ingredient: any) => ({
          item: ingredient.item || '',
          quantity: ingredient.quantity || '',
          unit: ingredient.unit || ''
        })),
        instructions: typeof recipe.instructions === 'string'
          ? recipe.instructions.split('\n').filter(Boolean)
          : Array.isArray(recipe.instructions)
            ? recipe.instructions
            : [recipe.instructions].filter(Boolean),
        nutritional_info: parseJsonField(recipe.nutritional_info, {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0
        }),
        health_benefits: parseJsonField(recipe.health_benefits, []),
        cooking_steps: parseJsonField(recipe.cooking_steps, [])
      })) as Recipe[];

      toast.success("Recettes générées avec succès !");
      return allRecipes;

    } catch (err) {
      console.error("Error generating recipes:", err);
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