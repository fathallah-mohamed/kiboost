import { useState } from 'react';
import { Recipe, ChildProfile, RecipeFilters } from '../types';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useRecipeGeneration = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const clearRecipes = () => {
    console.log('Clearing recipes and localStorage');
    localStorage.removeItem('generated_recipes');
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
      });

      if (functionError) {
        console.error('Error from Edge Function:', functionError);
        throw new Error(functionError.message);
      }

      console.log('Generated recipes:', data);
      
      if (!data || !Array.isArray(data)) {
        throw new Error('Format de réponse invalide');
      }

      // Ensure each recipe has required fields
      const validatedRecipes = data.map(recipe => ({
        ...recipe,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        profile_id: child.profile_id,
        is_generated: true,
      }));

      setRecipes(validatedRecipes);
      localStorage.setItem('generated_recipes', JSON.stringify(validatedRecipes));

    } catch (err) {
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