import { useState } from "react";
import { Recipe, RecipeFilters, ChildProfile } from "../../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useRecipeGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateRecipes = async (child: ChildProfile, filters: RecipeFilters) => {
    try {
      setLoading(true);
      setError(null);

      console.log("Generating recipes with filters:", filters);

      // Générer de nouvelles recettes
      const { data: response, error: generateError } = await supabase.functions.invoke(
        'generate-recipe',
        {
          body: { 
            child: {
              ...child,
              profile_id: child.id // Correction du type
            },
            filters
          }
        }
      );

      if (generateError) throw generateError;

      console.log("Generated recipe response:", response);

      // Récupérer aussi les recettes historiques qui correspondent aux filtres
      const { data: existingRecipes, error: fetchError } = await supabase
        .from('recipes')
        .select('*')
        .eq('is_generated', true)
        .eq(filters.mealType ? 'meal_type' : true, filters.mealType || true)
        .lte('preparation_time', filters.maxPrepTime || 120)
        .eq(filters.difficulty ? 'difficulty' : true, filters.difficulty || true);

      if (fetchError) throw fetchError;

      // Convertir les données en type Recipe
      const allRecipes = [...(response.recipes || []), ...(existingRecipes || [])].map(recipe => ({
        ...recipe,
        ingredients: typeof recipe.ingredients === 'string' 
          ? JSON.parse(recipe.ingredients)
          : recipe.ingredients,
        instructions: typeof recipe.instructions === 'string'
          ? recipe.instructions.split('\n').filter(Boolean)
          : Array.isArray(recipe.instructions)
            ? recipe.instructions
            : [recipe.instructions].filter(Boolean),
        nutritional_info: typeof recipe.nutritional_info === 'string'
          ? JSON.parse(recipe.nutritional_info)
          : recipe.nutritional_info,
        health_benefits: typeof recipe.health_benefits === 'string'
          ? JSON.parse(recipe.health_benefits)
          : recipe.health_benefits || [],
        cooking_steps: typeof recipe.cooking_steps === 'string'
          ? JSON.parse(recipe.cooking_steps)
          : recipe.cooking_steps || []
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