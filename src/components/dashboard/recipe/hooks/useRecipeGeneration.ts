import { Recipe, RecipeFilters, ChildProfile } from "../../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSession } from "@supabase/auth-helpers-react";
import { useRecipeGenerationState } from "./useRecipeGenerationState";
import { useRecipeSavingLogic } from "./useRecipeSavingLogic";

export const useRecipeGeneration = () => {
  const session = useSession();
  const { 
    loading, 
    setLoading, 
    error, 
    setError, 
    stepState, 
    updateStepState 
  } = useRecipeGenerationState();
  
  const { saveGeneratedRecipes } = useRecipeSavingLogic(session?.user?.id);

  const generateRecipes = async (child: ChildProfile, filters: RecipeFilters) => {
    try {
      if (!child) {
        toast.error("Veuillez sélectionner au moins un enfant");
        return [];
      }

      setLoading(true);
      setError(null);
      updateStepState({ hasSelectedChild: true });

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

      const successfullySavedRecipes = await saveGeneratedRecipes(response.recipes);

      if (successfullySavedRecipes.length > 0) {
        toast.success(`${successfullySavedRecipes.length} recettes générées et sauvegardées`);
        updateStepState({ 
          hasGeneratedRecipes: true,
          message: `${successfullySavedRecipes.length} recettes adaptées à vos enfants ont été générées !`
        });
      } else {
        toast.error("Aucune recette n'a pu être générée avec les paramètres actuels");
        updateStepState({
          hasGeneratedRecipes: false,
          message: "Aucune recette ne correspond à vos critères. Essayez d'élargir vos filtres."
        });
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

  const markRecipeInteraction = () => {
    updateStepState({ 
      hasInteractedWithRecipes: true,
      message: "Étape terminée : Recettes générées avec succès !"
    });
  };

  return {
    generateRecipes,
    markRecipeInteraction,
    loading,
    error,
    stepState
  };
};