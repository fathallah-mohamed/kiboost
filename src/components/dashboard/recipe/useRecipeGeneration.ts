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
      
      console.log('Generating recipes for children:', child, 'with filters:', filters);
      
      const { data: generatedRecipes, error: functionError } = await supabase.functions.invoke('generate-recipe', {
        body: {
          childProfiles: [child],
          filters,
        },
      });

      if (functionError) {
        console.error('Error from Edge Function:', functionError);
        throw new Error(functionError.message);
      }

      console.log('Generated recipes:', generatedRecipes);
      
      if (!generatedRecipes || !Array.isArray(generatedRecipes)) {
        throw new Error('Format de réponse invalide');
      }

      // Sauvegarder les recettes générées dans la base de données
      const savedRecipes = await Promise.all(
        generatedRecipes.map(async (recipe) => {
          const { data: savedRecipe, error: saveError } = await supabase
            .from('recipes')
            .insert({
              ...recipe,
              profile_id: (await supabase.auth.getSession()).data.session?.user.id,
              is_generated: true,
            })
            .select('*')
            .single();

          if (saveError) {
            console.error('Error saving recipe:', saveError);
            throw saveError;
          }

          return savedRecipe;
        })
      );

      console.log('Saved recipes:', savedRecipes);
      setRecipes(savedRecipes);

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