import { useState } from "react";
import { Recipe, RecipeFilters, ChildProfile } from "../../types";
import { GenerationStep, StepStatus } from "../../types/steps";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSession } from "@supabase/auth-helpers-react";
import { useRecipeSaving } from "./useRecipeSaving";

export const useRecipeGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const session = useSession();
  const { saveRecipe } = useRecipeSaving();
  const [stepState, setStepState] = useState<GenerationStep>({
    status: "not_started",
    hasSelectedChild: false,
    hasGeneratedRecipes: false,
    hasInteractedWithRecipes: false,
  });

  const updateStepState = (updates: Partial<GenerationStep>) => {
    setStepState(prev => {
      const newState = { ...prev, ...updates };
      
      // Determine the overall status based on conditions
      let status: StepStatus = "not_started";
      
      if (newState.hasSelectedChild && newState.hasGeneratedRecipes) {
        status = "in_progress";
      }
      
      if (newState.hasSelectedChild && newState.hasGeneratedRecipes && newState.hasInteractedWithRecipes) {
        status = "completed";
      }
      
      return { ...newState, status };
    });
  };

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

      // Save each generated recipe
      const savedRecipes = await Promise.all(
        response.recipes.map(async (recipe: Recipe) => {
          try {
            const recipeWithMetadata = {
              ...recipe,
              is_generated: true,
              profile_id: session?.user?.id
            };
            
            await saveRecipe(recipeWithMetadata);
            return recipeWithMetadata;
          } catch (error) {
            console.error('Error saving generated recipe:', error);
            toast.error(`Erreur lors de la sauvegarde de la recette ${recipe.name}`);
            return null;
          }
        })
      );

      const successfullySavedRecipes = savedRecipes.filter((recipe): recipe is Recipe => recipe !== null);

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