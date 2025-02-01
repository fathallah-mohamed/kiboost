import { useState } from "react";
import { Recipe, RecipeFilters, ChildProfile } from "../../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  transformToRecipeData, 
  transformDatabaseToRecipe, 
  GeneratedRecipe 
} from "../utils/recipeTransformers";

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

      // Fetch existing recipes for this child with similar filters
      const { data: existingRecipes, error: fetchError } = await supabase
        .from('recipes')
        .select('*')
        .eq('profile_id', child.profile_id)
        .eq('child_id', child.id)
        .eq('auto_generated', true)
        .eq('meal_type', filters.mealType !== 'all' ? filters.mealType : 'dinner')
        .lte('max_prep_time', filters.maxPrepTime || 30)
        .eq('difficulty', filters.difficulty !== 'all' ? filters.difficulty : 'medium');

      if (fetchError) throw fetchError;

      console.log("Existing recipes found:", existingRecipes);

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

      // Delete old generated recipes for this child
      const { error: deleteError } = await supabase
        .from('recipes')
        .delete()
        .eq('profile_id', child.profile_id)
        .eq('child_id', child.id)
        .eq('auto_generated', true);

      if (deleteError) throw deleteError;

      const savedRecipes: Recipe[] = [];

      // Save new recipes
      for (const recipe of response.recipes as GeneratedRecipe[]) {
        try {
          const recipeData = transformToRecipeData(recipe, child.profile_id);
          recipeData.child_id = child.id;
          recipeData.auto_generated = true;
          recipeData.source = 'ia';

          const { data: savedRecipe, error: saveError } = await supabase
            .from('recipes')
            .insert(recipeData)
            .select()
            .single();

          if (saveError) throw saveError;
          if (savedRecipe) {
            savedRecipes.push(transformDatabaseToRecipe(savedRecipe));
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