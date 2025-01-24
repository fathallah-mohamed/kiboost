import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Recipe, ChildProfile } from '../types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Copy } from 'lucide-react';
import { RecipeCard } from '../recipe/recipe-card/RecipeCard';
import { cn } from '@/lib/utils';

interface MealPlannerGridProps {
  selectedDate: Date;
  plannedRecipes: { [key: string]: Recipe | null };
  selectedChildren: ChildProfile[];
  onPlanMeal: (date: string, childId: string) => void;
  onRemoveRecipe?: (date: string, childId: string) => void;
  readOnly?: boolean;
}

const CHILD_COLORS = [
  'bg-pink-100 border-pink-300',
  'bg-blue-100 border-blue-300',
  'bg-purple-100 border-purple-300',
  'bg-green-100 border-green-300',
  'bg-yellow-100 border-yellow-300',
];

export const MealPlannerGrid = ({
  selectedDate,
  plannedRecipes,
  selectedChildren,
  onPlanMeal,
  onRemoveRecipe,
  readOnly = false,
}: MealPlannerGridProps) => {
  const getDayLabel = (date: Date) => {
    return format(date, 'EEEE d MMMM', { locale: fr });
  };

  const getChildColor = (index: number) => {
    return CHILD_COLORS[index % CHILD_COLORS.length];
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <Card className="p-4">
          <div className="font-medium text-lg mb-4">
            {getDayLabel(selectedDate)}
          </div>
          <div className="space-y-4">
            {selectedChildren.map((child, index) => {
              const formattedDate = format(selectedDate, 'yyyy-MM-dd');
              const recipe = plannedRecipes[`${formattedDate}-${child.id}`];

              return (
                <div
                  key={child.id}
                  className={cn(
                    "p-4 rounded-lg border-2",
                    getChildColor(index)
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Repas de {child.name}</h3>
                    {!readOnly && (
                      <div className="flex gap-2">
                        {recipe && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <Copy className="h-4 w-4" />
                            Copier
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onPlanMeal(formattedDate, child.id)}
                          className="flex items-center gap-1"
                        >
                          <Plus className="h-4 w-4" />
                          {recipe ? 'Modifier' : 'Ajouter'}
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {recipe ? (
                    <div className="relative">
                      <RecipeCard
                        recipe={recipe}
                        compact
                        onRemove={
                          !readOnly && onRemoveRecipe
                            ? () => onRemoveRecipe(formattedDate, child.id)
                            : undefined
                        }
                      />
                      {child.allergies.some(allergy => 
                        recipe.allergens?.includes(allergy)
                      ) && (
                        <div className="absolute top-2 right-2 bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                          ⚠️ Contient des allergènes
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-sm">
                      Aucun repas planifié
                    </div>
                  )}
                  
                  <div className="mt-2 text-xs text-muted-foreground">
                    {child.allergies.length > 0 && (
                      <div>Allergies: {child.allergies.join(', ')}</div>
                    )}
                    {child.preferences.length > 0 && (
                      <div>Préférences: {child.preferences.join(', ')}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};