import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { AvailableIngredient } from '../types';

interface AvailableIngredientsListProps {
  ingredients: AvailableIngredient[];
  onRemove: (id: string) => void;
}

export const AvailableIngredientsList = ({ ingredients, onRemove }: AvailableIngredientsListProps) => {
  return (
    <div className="space-y-2">
      {ingredients.map((ingredient) => (
        <div key={ingredient.id} className="flex items-center justify-between p-2 bg-secondary/20 rounded-lg">
          <span>
            {ingredient.ingredient_name} - {ingredient.quantity} {ingredient.unit}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => ingredient.id && onRemove(ingredient.id)}
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      ))}
    </div>
  );
};