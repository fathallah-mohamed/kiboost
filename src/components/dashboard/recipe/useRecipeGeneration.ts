import { useState } from 'react';
import { Recipe, ChildProfile, RecipeFilters } from '../types';
import { useToast } from '@/components/ui/use-toast';

export const useRecipeGeneration = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const clearRecipes = () => {
    console.log('Clearing recipes');
    setRecipes([]);
    setLoading(false);
    setError(null);
  };

  const generateRecipes = async (child: ChildProfile, filters?: RecipeFilters) => {
    try {
      setLoading(true);
      setError(null);
      setRecipes([]); // Clear recipes before generating new ones
      
      const response = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          child,
          filters,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate recipes');
      }

      const data = await response.json();
      console.log('Generated recipes:', data);
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