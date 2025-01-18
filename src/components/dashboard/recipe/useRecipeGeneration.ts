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
    setRecipes([]);
    setError(null);
  };

  const generateRecipes = async (child: ChildProfile, filters?: RecipeFilters) => {
    try {
      console.log('Début de la génération de recettes avec:', { child, filters });
      setLoading(true);
      setError(null);

      const { data, error: functionError } = await supabase.functions.invoke('generate-recipe', {
        body: {
          childProfiles: [child],
          filters,
        },
      });

      if (functionError) {
        console.error('Erreur de la fonction Edge:', functionError);
        throw new Error(functionError.message);
      }

      if (!data || !Array.isArray(data)) {
        throw new Error('Format de réponse invalide');
      }

      console.log('Recettes reçues:', data);

      // Validate and transform recipes
      const validatedRecipes = data.map(recipe => ({
        ...recipe,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        profile_id: child.profile_id,
        is_generated: true,
        image_url: recipe.image_url || 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
      }));

      setRecipes(validatedRecipes);
      
      toast({
        title: "Succès",
        description: `${validatedRecipes.length} recettes ont été générées.`,
      });

    } catch (err) {
      console.error('Erreur lors de la génération des recettes:', err);
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      
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
    clearRecipes,
  };
};