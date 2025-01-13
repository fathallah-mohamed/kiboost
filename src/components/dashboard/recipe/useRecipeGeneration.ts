import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";
import { Recipe, ChildProfile, RecipeFilters } from "../types";

export const useRecipeGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const generateRecipes = async (selectedChild: ChildProfile, filters?: RecipeFilters) => {
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Non authentifié");

      // Générer 3 recettes différentes
      const recipePromises = Array(3).fill(null).map(async () => {
        const response = await supabase.functions.invoke('generate-recipe', {
          body: {
            childProfile: {
              age: selectedChild.age,
              allergies: selectedChild.allergies,
              preferences: selectedChild.preferences,
            },
            filters,
          },
        });

        if (response.error) throw response.error;
        return response.data;
      });

      const generatedRecipes = await Promise.all(recipePromises);
      setRecipes(generatedRecipes);
      
      toast({
        title: "Recettes générées",
        description: "De nouvelles recettes ont été créées pour " + selectedChild.name,
      });
    } catch (error: any) {
      console.error('Error generating recipes:', error);
      setError(error.message || "Une erreur est survenue lors de la génération des recettes");
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de générer les recettes. Veuillez réessayer dans quelques instants.",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    recipes,
    error,
    generateRecipes,
  };
};