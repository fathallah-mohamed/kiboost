import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";
import { Recipe, ChildProfile } from "../types";

export const useRecipeGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const generateRecipe = async (selectedChild: ChildProfile) => {
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Non authentifié");

      const maxRetries = 3;
      let attempt = 0;
      let lastError;

      while (attempt < maxRetries) {
        try {
          const response = await supabase.functions.invoke('generate-recipe', {
            body: {
              childProfile: {
                age: selectedChild.age,
                allergies: selectedChild.allergies,
                preferences: selectedChild.preferences,
              },
            },
          });

          if (response.error) throw response.error;
          
          // Ensure instructions is an array of strings
          const recipeData = {
            ...response.data,
            instructions: Array.isArray(response.data.instructions) 
              ? response.data.instructions 
              : [response.data.instructions].filter(Boolean)
          };
          
          setRecipe(recipeData);
          toast({
            title: "Recette générée",
            description: "Une nouvelle recette a été créée pour " + selectedChild.name,
          });
          return;
        } catch (error: any) {
          lastError = error;
          console.error(`Attempt ${attempt + 1} failed:`, error);
          
          if (error.message?.includes('Too Many Requests')) {
            attempt++;
            if (attempt < maxRetries) {
              const delay = Math.pow(2, attempt) * 1000;
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
          } else {
            throw error;
          }
        }
      }
      
      throw lastError;
    } catch (error: any) {
      console.error('Error generating recipe:', error);
      setError(error.message || "Une erreur est survenue lors de la génération de la recette");
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de générer la recette. Veuillez réessayer dans quelques instants.",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    recipe,
    error,
    generateRecipe,
  };
};