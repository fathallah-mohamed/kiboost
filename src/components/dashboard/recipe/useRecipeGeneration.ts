import { useState } from "react";
import { Recipe, RecipeFilters, ChildProfile } from "../types";
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

      const { data: response, error: generateError } = await supabase.functions.invoke(
        'generate-recipe',
        {
          body: { 
            child,
            filters
          }
        }
      );

      if (generateError) throw generateError;

      console.log("Generated recipe response:", response);

      const { data: saveData, error: saveError } = await supabase
        .from('recipes')
        .insert(response.recipes.map((recipe: any) => ({
          ...recipe,
          profile_id: child.profile_id,
          is_generated: true,
          ingredients: Array.isArray(recipe.ingredients) 
            ? recipe.ingredients 
            : JSON.parse(recipe.ingredients),
          instructions: Array.isArray(recipe.instructions)
            ? recipe.instructions
            : recipe.instructions.split('\n').filter(Boolean),
          nutritional_info: typeof recipe.nutritional_info === 'string'
            ? JSON.parse(recipe.nutritional_info)
            : recipe.nutritional_info,
          health_benefits: typeof recipe.health_benefits === 'string'
            ? JSON.parse(recipe.health_benefits)
            : recipe.health_benefits || [],
          cooking_steps: typeof recipe.cooking_steps === 'string'
            ? JSON.parse(recipe.cooking_steps)
            : recipe.cooking_steps || []
        })))
        .select();

      if (saveError) throw saveError;

      toast.success("Recettes générées avec succès !");
      return saveData as Recipe[];

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