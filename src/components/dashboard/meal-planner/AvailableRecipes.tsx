import { Recipe } from '../types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Clock, Utensils } from 'lucide-react';
import { useFavorites } from '../recipe/hooks/useFavorites';

interface AvailableRecipesProps {
  recipes: Recipe[];
  loading: boolean;
  planningRecipe: boolean;
  onPlanRecipe: (recipe: Recipe) => void;
}

export const AvailableRecipes = ({ 
  recipes, 
  loading, 
  planningRecipe, 
  onPlanRecipe 
}: AvailableRecipesProps) => {
  const { favoriteRecipes } = useFavorites();

  if (loading) {
    return <p>Chargement des recettes...</p>;
  }

  if (recipes.length === 0) {
    return <p>Aucune recette disponible. Générez d'abord des recettes dans l'onglet "Recettes".</p>;
  }

  // Sort recipes to show favorites first
  const sortedRecipes = [...recipes].sort((a, b) => {
    const aIsFavorite = favoriteRecipes.includes(a.id);
    const bIsFavorite = favoriteRecipes.includes(b.id);
    if (aIsFavorite && !bIsFavorite) return -1;
    if (!aIsFavorite && bIsFavorite) return 1;
    return 0;
  });

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Recettes disponibles</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedRecipes.map((recipe) => (
          <Card key={recipe.id} className={`p-4 ${favoriteRecipes.includes(recipe.id) ? 'border-primary' : ''}`}>
            <div className="flex flex-col h-full">
              <div className="flex-1">
                <h4 className="font-medium mb-2">
                  {favoriteRecipes.includes(recipe.id) && (
                    <span className="text-primary mr-2">★</span>
                  )}
                  {recipe.name}
                </h4>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {recipe.preparation_time} min
                  </span>
                  <span className="flex items-center gap-1">
                    <Utensils className="w-4 h-4" />
                    {recipe.difficulty}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {recipe.nutritional_info.calories} calories
                </p>
              </div>
              <Button 
                className="mt-4 w-full"
                onClick={() => onPlanRecipe(recipe)}
                disabled={planningRecipe}
              >
                Planifier
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};