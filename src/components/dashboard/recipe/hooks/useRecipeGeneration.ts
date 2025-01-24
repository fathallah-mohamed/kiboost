import { useState } from "react";
import { Recipe, RecipeFilters, ChildProfile } from "../../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

const parseJsonField = <T>(field: Json | null, defaultValue: T): T => {
  if (typeof field === 'string') {
    try {
      return JSON.parse(field) as T;
    } catch {
      return defaultValue;
    }
  }
  return (field as T) || defaultValue;
};

export const useRecipeGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateRecipes = async (child: ChildProfile, filters: RecipeFilters) => {
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
              id: child.id
            },
            filters
          }
        }
      );

      if (generateError) throw generateError;

      console.log("Generated recipe response:", response);

      let query = supabase
        .from('recipes')
        .select('*')
        .eq('is_generated', true);

      if (filters.mealType && filters.mealType !== 'all') {
        query = query.eq('meal_type', filters.mealType);
      }
      
      if (filters.maxPrepTime) {
        query = query.lte('preparation_time', filters.maxPrepTime);
      }

      if (filters.difficulty && filters.difficulty !== 'all') {
        query = query.eq('difficulty', filters.difficulty);
      }

      const { data: existingRecipes, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const allRecipes = [...(response.recipes || []), ...(existingRecipes || [])].map(recipe => ({
        ...recipe,
        ingredients: parseJsonField(recipe.ingredients, []),
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