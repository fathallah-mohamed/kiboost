import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Recipe, ChildProfile } from "../../types";
import { transformToRecipeData, transformDatabaseToRecipe, GeneratedRecipe } from "../utils/recipeTransformers";

export const useRecipeGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const generateRecipes = async (child: ChildProfile, filters: any = {}) => {
    try {
      setLoading(true);
      setError(null);

      console.log("Generating recipes for child:", child);
      console.log("Using filters:", filters);

      // Call the Edge Function to generate recipes
      const { data: generatedData, error: generationError } = await supabase.functions.invoke(
        'generate-recipe',
        {
          body: {
            childName: child.name,
            birthDate: child.birth_date,
            allergies: child.allergies || [],
            preferences: child.preferences || [],
            ...filters
          }
        }
      );

      if (generationError) {
        console.error("Error generating recipes:", generationError);
        throw new Error("Erreur lors de la génération des recettes");
      }

      console.log("Generated recipe data:", generatedData);

      if (!generatedData || !Array.isArray(generatedData)) {
        throw new Error("Format de données invalide reçu du générateur");
      }

      // Transform and save each recipe
      const savedRecipes: Recipe[] = [];
      for (const recipeData of generatedData) {
        const { data: savedRecipe, error: saveError } = await supabase
          .from('recipes')
          .insert(transformToRecipeData(recipeData, child.profile_id))
          .select('*')
          .single();

        if (saveError) {
          console.error("Error saving recipe:", saveError);
          continue;
        }

        if (savedRecipe) {
          savedRecipes.push(transformDatabaseToRecipe(savedRecipe as GeneratedRecipe));
        }
      }

      console.log("Saved recipes:", savedRecipes);
      toast({
        title: "Recettes générées avec succès",
        description: `${savedRecipes.length} nouvelles recettes ont été créées.`
      });

      return savedRecipes;

    } catch (err) {
      console.error("Error in generateRecipes:", err);
      const errorMessage = err instanceof Error ? err.message : "Une erreur est survenue";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: errorMessage
      });
      return [];
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