import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, isSameMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Recipe, ChildProfile } from '../types';
import { RecipeCard } from '../recipe/RecipeCard';
import { Trash2, Users, User } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const groupRecipesByDay = (date: string) => {
    const recipeGroups: { [key: string]: string[] } = {};
    
    selectedChildren.forEach(child => {
      const recipe = plannedRecipes[`${date}-${child.id}`];
      if (recipe) {
        const recipeId = recipe.id;
        if (!recipeGroups[recipeId]) {
          recipeGroups[recipeId] = [];
        }
        recipeGroups[recipeId].push(child.id);
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
              {Object.entries(recipeGroups).map(([recipeId, childIds]) => {
                const recipe = plannedRecipes[`${formattedDate}-${childIds[0]}`];
                if (!recipe) return null;

                return (
                  <div key={recipeId} className="relative bg-background rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      {childIds.length === selectedChildren.length ? (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-primary" />
                          <span className="text-sm text-primary">Tous les enfants</span>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {childIds.map(childId => {
                            const child = selectedChildren.find(c => c.id === childId);
                            if (!child) return null;
                            return (
                              <TooltipProvider key={childId}>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Avatar className="h-6 w-6">
                                      <span className="text-xs">{getInitials(child.name)}</span>
                                    </Avatar>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{child.name}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            );
                          })}
                        </div>
                      )}

                      {!readOnly && onRemoveRecipe && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 ml-auto text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            childIds.forEach(childId => {
                              onRemoveRecipe(formattedDate, childId);
                            });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <RecipeCard recipe={recipe} compact />
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
};