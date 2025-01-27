import { useState } from "react";
import { Recipe, ChildProfile, RecipeFilters } from "../../types";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { toast } from "sonner";

export const useRecipeGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const session = useSession();

  const generateRecipes = async (child: ChildProfile, filters: RecipeFilters) => {
    if (!session?.user?.id) {
      toast.error("Vous devez être connecté pour générer des recettes");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log("Starting recipe generation for child:", child.name);

      const { data: response, error: generateError } = await supabase.functions.invoke(
        'generate-recipe',
        {
          body: { child, filters }
        }
      );

      if (generateError) {
        console.error("Error from generate-recipe function:", generateError);
        throw generateError;
      }

      if (!response.recipes || !Array.isArray(response.recipes)) {
        throw new Error("Format de réponse invalide");
      }

      console.log("Successfully generated recipes:", response.recipes);

      const savedRecipes: Recipe[] = [];
      const timestamp = new Date().toISOString();

      for (const recipe of response.recipes) {
        try {
          const { data: savedRecipe, error: saveError } = await supabase
            .from('recipes')
            .insert({
              ...recipe,
              profile_id: session.user.id,
              is_generated: true,
              created_at: timestamp,
              updated_at: timestamp
            })
            .select('*')
            .single();

          if (saveError) {
            console.error('Error saving recipe:', saveError);
            continue;
          }

          console.log('Successfully saved recipe:', savedRecipe);
          savedRecipes.push(savedRecipe);
          
        } catch (error) {
          console.error('Error processing recipe:', recipe.name, error);
          continue;
        }
      }

      if (savedRecipes.length === 0) {
        throw new Error("Aucune recette n'a pu être sauvegardée");
      }

      toast.success(`${savedRecipes.length} recettes ont été générées avec succès !`);
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