
import { useState } from "react";
import { Recipe, RecipeFilters, ChildProfile } from "@/components/dashboard/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useRecipeGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      if (generateError) {
        // Vérifier si c'est une erreur de quota insuffisant
        if (generateError.message?.includes("quota Perplexity est insuffisant")) {
          toast.error("Quota Perplexity insuffisant", {
            description: "Veuillez mettre à jour votre abonnement Perplexity pour continuer à générer des recettes.",
            action: {
              label: "Mettre à jour",
              onClick: () => window.open("https://www.perplexity.ai/settings/subscription", "_blank")
            }
          });
        }
        throw generateError;
      }

      console.log("Generated recipe response:", response);

      if (!response.recipes || !Array.isArray(response.recipes)) {
        throw new Error("Format de réponse invalide");
      }

      return response.recipes;

    } catch (err) {
      console.error("Error generating recipes:", err);
      const errorMessage = err instanceof Error ? err.message : "Une erreur est survenue";
      setError(errorMessage);
      
      // Si ce n'est pas déjà une erreur de quota insuffisant (pour éviter le double toast)
      if (!errorMessage.includes("quota Perplexity est insuffisant")) {
        toast.error(errorMessage);
      }
      
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
