import { useState } from 'react';
import { Recipe, ChildProfile, RecipeFilters } from '../types';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useRecipeGeneration = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const generateRecipes = async (child: ChildProfile, filters?: RecipeFilters, offset: number = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Generating recipes for children:', child, 'with filters:', filters, 'offset:', offset);
      
      const { data, error: functionError } = await supabase.functions.invoke('generate-recipe', {
        body: {
          childProfiles: [child],
          filters,
          offset,
        },
      });

      if (functionError) {
        console.error('Error from Edge Function:', functionError);
        throw new Error(functionError.message);
      }

      console.log('Generated recipes:', data);
      
      if (!data || !Array.isArray(data)) {
        throw new Error('Format de réponse invalide');
      }

      // Si c'est la première génération (offset = 0), on remplace les recettes
      // Sinon on ajoute les nouvelles recettes à la liste existante
      if (offset === 0) {
        setRecipes(data);
      } else {
        setRecipes(prevRecipes => [...prevRecipes, ...data]);
      }
    } catch (err) {
      console.error('Error generating recipes:', err);
      setError('Une erreur est survenue lors de la génération des recettes.');
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de générer les recettes.",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearRecipes = () => {
    setRecipes([]);
    setLoading(false);
    setError(null);
  };

  return {
    recipes,
    loading,
    error,
    generateRecipes,
    clearRecipes
  };
};