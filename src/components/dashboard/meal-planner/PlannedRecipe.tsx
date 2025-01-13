import { Recipe } from '../types';
import { Card } from '@/components/ui/card';
import { RecipeCard } from '../recipe/RecipeCard';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PlannedRecipeProps {
  recipe: Recipe | null;
  selectedDate: Date;
}

export const PlannedRecipe = ({ recipe, selectedDate }: PlannedRecipeProps) => {
  if (!recipe) return null;

  return (
    <Card className="mt-4 p-4">
      <h3 className="text-lg font-semibold mb-2">
        Recette planifiée pour le {format(selectedDate, 'dd MMMM yyyy', { locale: fr })}
      </h3>
      <RecipeCard recipe={recipe} />
    </Card>
  );
};