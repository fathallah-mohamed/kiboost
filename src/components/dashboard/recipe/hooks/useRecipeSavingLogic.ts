import { Recipe } from "../../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useRecipeSavingLogic = (userId?: string) => {
  const saveGeneratedRecipes = async (recipes: Recipe[]) => {
    if (!userId) {
      console.error('No user ID provided for saving recipes');
      return [];
    }

    const savedRecipes = await Promise.all(
      recipes.map(async (recipe: Recipe) => {
        try {
          const recipeWithMetadata = {
            ...recipe,
            is_generated: true,
            profile_id: userId
          };
          
          const { error } = await supabase
            .from('recipes')
            .insert(recipeWithMetadata);

          if (error) throw error;
          return recipeWithMetadata;
        } catch (error) {
          console.error('Error saving generated recipe:', error);
          toast.error(`Erreur lors de la sauvegarde de la recette ${recipe.name}`);
          return null;
        }
      })
    );

    return savedRecipes.filter((recipe): recipe is Recipe => recipe !== null);
  };

  return { saveGeneratedRecipes };
};