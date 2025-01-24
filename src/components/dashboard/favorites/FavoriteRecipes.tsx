import { useEffect, useState } from 'react';
import { Recipe } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { RecipeCard } from '../recipe/RecipeCard';
import { useToast } from '@/hooks/use-toast';
import { useFavorites } from '../recipe/hooks/useFavorites';

interface FavoriteRecipesProps {
  onSectionChange?: (section: string) => void;
}

export const FavoriteRecipes = ({ onSectionChange }: FavoriteRecipesProps) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { removeFavorite } = useFavorites();

  useEffect(() => {
    fetchFavoriteRecipes();
  }, []);

  const fetchFavoriteRecipes = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;

      const { data: favorites, error: favoritesError } = await supabase
        .from('recipe_favorites')
        .select('recipe_id')
        .eq('profile_id', session.session.user.id);

      if (favoritesError) throw favoritesError;

      if (favorites && favorites.length > 0) {
        const recipeIds = favorites.map(f => f.recipe_id);
        const { data: recipesData, error: recipesError } = await supabase
          .from('recipes')
          .select('*')
          .in('id', recipeIds);

        if (recipesError) throw recipesError;
        setRecipes(recipesData || []);
      }
    } catch (error) {
      console.error('Error fetching favorite recipes:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les recettes favorites.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (recipe: Recipe) => {
    await removeFavorite(recipe);
    await fetchFavoriteRecipes();
  };

  if (loading) {
    return <div>Chargement des recettes favorites...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Recettes favorites</h2>
      {recipes.length === 0 ? (
        <p className="text-muted-foreground">Aucune recette favorite pour le moment.</p>
      ) : (
        <div className="grid gap-6">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onRemove={() => handleRemoveFavorite(recipe)}
            />
          ))}
        </div>
      )}
    </div>
  );
};