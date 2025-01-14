import { useState, useEffect } from 'react';
import { Recipe, ChildProfile, RecipeFilters } from '../types';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEY = 'generated_recipes';

export const useRecipeGeneration = () => {
  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    // Initialize from localStorage if available
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Persist recipes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
  }, [recipes]);

  const clearRecipes = () => {
    console.log('Clearing recipes and localStorage');
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
          childProfile: child,
          filters,
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

      setRecipes(data);
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

  return {
    recipes,
    loading,
    error,
    generateRecipes,
    clearRecipes
  };
};