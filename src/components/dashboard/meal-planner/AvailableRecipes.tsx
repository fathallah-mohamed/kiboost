import { Recipe } from '../types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

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
  if (loading) {
    return <p>Chargement des recettes...</p>;
  }

  if (recipes.length === 0) {
    return <p>Aucune recette disponible. Générez d'abord des recettes dans l'onglet "Recettes".</p>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Recettes disponibles</h3>
      {recipes.map((recipe) => (
        <Card key={recipe.id} className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium">{recipe.name}</h4>
              <p className="text-sm text-gray-500">
                {recipe.nutritional_info.calories} calories
              </p>
            </div>
            <Button 
              onClick={() => onPlanRecipe(recipe)}
              disabled={planningRecipe}
            >
              Planifier
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};