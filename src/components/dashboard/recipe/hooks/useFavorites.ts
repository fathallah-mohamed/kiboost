import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Recipe } from '../../types';
import { useToast } from '@/components/ui/use-toast';

export const useFavorites = () => {
  const [favoriteRecipes, setFavoriteRecipes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchFavorites = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('recipe_favorites')
        .select('recipe_id')
        .eq('profile_id', session.user.id);

      if (error) throw error;
      setFavoriteRecipes(data.map(fav => fav.recipe_id));
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger vos favoris.",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (recipe: Recipe) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const isFavorite = favoriteRecipes.includes(recipe.id);

      if (isFavorite) {
        const { error } = await supabase
          .from('recipe_favorites')
          .delete()
          .eq('recipe_id', recipe.id)
          .eq('profile_id', session.user.id);

        if (error) throw error;
        setFavoriteRecipes(prev => prev.filter(id => id !== recipe.id));
      } else {
        const { error } = await supabase
          .from('recipe_favorites')
          .insert({ recipe_id: recipe.id, profile_id: session.user.id });

        if (error) throw error;
        setFavoriteRecipes(prev => [...prev, recipe.id]);
      }

      toast({
        title: isFavorite ? "Retiré des favoris" : "Ajouté aux favoris",
        description: isFavorite 
          ? "La recette a été retirée de vos favoris"
          : "La recette a été ajoutée à vos favoris",
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue.",
      });
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  return {
    favoriteRecipes,
    loading,
    toggleFavorite,
    fetchFavorites
  };
};