import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, isSameMonth, addWeeks, subWeeks } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Recipe, ChildProfile } from '../types';
import { ChevronLeft, ChevronRight, Clock, Utensils, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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

  const handlePreviousWeek = () => {
    onSelectDate(subWeeks(selectedDate, 1));
  };

  const handleNextWeek = () => {
    onSelectDate(addWeeks(selectedDate, 1));
  };

  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  const days = getDaysToDisplay();
  const gridCols = viewMode === 'week' ? 'grid-cols-1' : 'md:grid-cols-7';
  const startDate = days[0];
  const endDate = days[days.length - 1];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-background p-4 rounded-lg shadow-sm">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreviousWeek}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Semaine précédente
        </Button>
        
        <div className="text-center">
          <h3 className="text-lg font-semibold">
            {format(startDate, 'd MMMM', { locale: fr })} - {format(endDate, 'd MMMM yyyy', { locale: fr })}
          </h3>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleNextWeek}
          className="flex items-center gap-2"
        >
          Semaine suivante
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className={`grid ${gridCols} gap-4`}>
        {days.map((day) => {
          const formattedDate = format(day, 'yyyy-MM-dd');
          const recipe = plannedRecipes[formattedDate];
          const isCurrentMonth = isSameMonth(day, selectedDate);
          
          return (
            <Card 
              key={day.toString()}
              className={`p-4 ${!readOnly ? 'hover:bg-secondary/10 transition-colors' : ''} ${
                format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                  ? 'border-primary/50'
                  : ''
              } ${
                !isCurrentMonth && viewMode === 'month' ? 'opacity-50' : ''
              }`}
              onClick={() => !readOnly && onSelectDate(day)}
            >
              <div className="text-center mb-4 pb-2 border-b">
                <div className="font-medium text-lg text-primary">
                  {format(day, 'EEEE', { locale: fr })}
                </div>
                <div className="text-sm text-muted-foreground">
                  {format(day, 'd MMMM', { locale: fr })}
                </div>
              </div>
              
              {recipe && (
                <div className="space-y-3">
                  <div className="p-3 bg-secondary/20 rounded-lg">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-medium line-clamp-2">{recipe.name}</h4>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{recipe.preparation_time} min</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Utensils className="w-3 h-3" />
                            <span>{recipe.meal_type}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {!readOnly && selectedChildren.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-border/50">
                        <div className="flex flex-wrap gap-2">
                          {selectedChildren.map(child => (
                            <div key={child.id} className="flex items-center gap-1">
                              <Tooltip>
                                <TooltipTrigger>
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback className="text-xs">
                                      {getInitials(child.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{child.name}</p>
                                </TooltipContent>
                              </Tooltip>
                              
                              {onRemoveRecipe && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onRemoveRecipe(formattedDate, child.id);
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Supprimer la recette pour {child.name}</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};