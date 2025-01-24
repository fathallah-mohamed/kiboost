import { useState } from "react";
import { Recipe, ChildProfile, RecipeFilters } from "../../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSession } from "@supabase/auth-helpers-react";
import { useRecipeSaving } from "./useRecipeSaving";

export const useRecipeGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const session = useSession();
  const { saveRecipe } = useRecipeSaving();

  const generateRecipes = async (child: ChildProfile, filters: RecipeFilters) => {
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
              ...child,
              id: child.id,
              name: child.name,
              birth_date: child.birth_date,
              allergies: child.allergies || [],
              preferences: child.preferences || []
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

      // Save each generated recipe to the database
      const savedRecipes = await Promise.all(
        response.recipes.map(async (recipe: Recipe) => {
          const recipeWithMetadata = {
            ...recipe,
            is_generated: true,
            profile_id: session?.user?.id
          };
          
          try {
            await saveRecipe(recipeWithMetadata);
            return recipeWithMetadata;
          } catch (error) {
            console.error('Error saving generated recipe:', error);
            toast.error(`Erreur lors de la sauvegarde de la recette ${recipe.name}`);
            return null;
          }
        })
      );

      // Filter out any recipes that failed to save
      const successfullySavedRecipes = savedRecipes.filter((recipe): recipe is Recipe => recipe !== null);

      if (successfullySavedRecipes.length > 0) {
        toast.success(`${successfullySavedRecipes.length} recettes générées et sauvegardées`);
      }

      return successfullySavedRecipes;

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