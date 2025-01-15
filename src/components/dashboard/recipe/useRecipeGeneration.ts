import { useState, useEffect } from 'react';
import { Recipe, ChildProfile, RecipeFilters } from '../types';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEY = 'generated_recipes';

export const useRecipeGeneration = () => {
  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
  }, [recipes]);

  const clearRecipes = () => {
    localStorage.removeItem(STORAGE_KEY);
    setRecipes([]);
    setLoading(false);
    setError(null);
  };

  const generateRecipes = async (child: ChildProfile, filters?: RecipeFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Generating recipes for child:', child, 'with filters:', filters);
      
      const { data, error: functionError } = await supabase.functions.invoke('generate-recipe', {
        body: {
          childProfiles: [child],
          filters,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (functionError) {
        console.error('Error from Edge Function:', functionError);
        throw new Error(functionError.message);
      }

      if (!data || !Array.isArray(data)) {
        throw new Error('Format de réponse invalide');
      }

      console.log('Generated recipes:', data);
      setRecipes(data);
      
      toast({
        title: "Recettes générées",
        description: `${data.length} recettes ont été générées avec succès.`,
      });

    } catch (err: any) {
      console.error('Error generating recipes:', err);
      setError('Une erreur est survenue lors de la génération des recettes.');
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de générer les recettes. Veuillez réessayer.",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    recipes,
    loading,
    error,
    generateRecipes,
    clearRecipes
  };
};