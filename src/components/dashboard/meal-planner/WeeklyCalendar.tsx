import { Card } from '@/components/ui/card';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, isSameMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Recipe, ChildProfile } from '../types';
import { PlannedMealCard } from './PlannedMealCard';

interface WeeklyCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  plannedRecipes: { [key: string]: Recipe | null };
  viewMode: 'week' | 'month';
  selectedChildren: ChildProfile[];
  readOnly?: boolean;
  onRemoveRecipe?: (date: string, childId: string) => void;
}

export const WeeklyCalendar = ({ 
  selectedDate, 
  onSelectDate, 
  plannedRecipes, 
  viewMode,
  selectedChildren,
  readOnly = false,
  onRemoveRecipe
}: WeeklyCalendarProps) => {
  const getDaysToDisplay = () => {
    if (viewMode === 'week') {
      const startOfCurrentWeek = startOfWeek(selectedDate, { weekStartsOn: 1 });
      return Array.from({ length: 7 }, (_, i) => addDays(startOfCurrentWeek, i));
    } else {
      const start = startOfMonth(selectedDate);
      const end = endOfMonth(selectedDate);
      const startWeek = startOfWeek(start, { weekStartsOn: 1 });
      const days = [];
      let day = startWeek;
      
      while (day <= end || days.length % 7 !== 0) {
        days.push(day);
        day = addDays(day, 1);
      }
      
      return days;
    }
  };

  const groupRecipesByDay = (date: string) => {
    const recipeGroups: { [key: string]: { recipe: Recipe; children: ChildProfile[] } } = {};
    
    selectedChildren.forEach(child => {
      const recipe = plannedRecipes[`${date}-${child.id}`];
      if (recipe) {
        const recipeId = recipe.id;
        if (!recipeGroups[recipeId]) {
          recipeGroups[recipeId] = {
            recipe,
            children: []
          };
        }
        recipeGroups[recipeId].children.push(child);
      }
    });
    
    return recipeGroups;
  };

  const days = getDaysToDisplay();
  const gridCols = viewMode === 'week' ? 'md:grid-cols-7' : 'md:grid-cols-7';

  return (
    <div className={`grid grid-cols-1 ${gridCols} gap-4`}>
      {days.map((day) => {
        const formattedDate = format(day, 'yyyy-MM-dd');
        const isCurrentMonth = isSameMonth(day, selectedDate);
        const recipeGroups = groupRecipesByDay(formattedDate);
        
        return (
          <Card 
            key={day.toString()}
            className={`p-4 ${!readOnly ? 'cursor-pointer hover:bg-secondary/50' : ''} ${
              format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                ? 'border-primary border-2'
                : ''
            } ${
              !isCurrentMonth && viewMode === 'month' ? 'opacity-50' : ''
            }`}
            onClick={() => !readOnly && onSelectDate(day)}
          >
            <div className="text-center mb-4">
              <div className="font-semibold">
                {format(day, viewMode === 'week' ? 'EEEE' : 'EEE', { locale: fr })}
              </div>
              <div className="text-sm text-muted-foreground">
                {format(day, 'd MMMM', { locale: fr })}
              </div>
            </div>

            <div className="space-y-4">
              {Object.entries(recipeGroups).map(([recipeId, { recipe, children }]) => (
                <PlannedMealCard
                  key={recipeId}
                  recipe={recipe}
                  children={children}
                  onRemove={() => {
                    if (onRemoveRecipe) {
                      children.forEach(child => {
                        onRemoveRecipe(formattedDate, child.id);
                      });
                    }
                  }}
                />
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
};