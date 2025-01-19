import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, isSameMonth, addWeeks, subWeeks } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Recipe, ChildProfile } from '../types';
import { RecipeCard } from '../recipe/recipe-card/RecipeCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { RecipeHealthBenefits } from '../recipe/recipe-card/RecipeHealthBenefits';

interface WeeklyCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  plannedRecipes: { [key: string]: Recipe | null };
  viewMode: 'week' | 'month';
  selectedChildren: ChildProfile[];
  readOnly?: boolean;
}

export const WeeklyCalendar = ({ 
  selectedDate, 
  onSelectDate, 
  plannedRecipes, 
  viewMode,
  selectedChildren,
  readOnly = false
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

  const days = getDaysToDisplay();
  const gridCols = viewMode === 'week' ? 'md:grid-cols-7' : 'md:grid-cols-7';
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

      <div className={`grid grid-cols-1 ${gridCols} gap-4`}>
        {days.map((day) => {
          const formattedDate = format(day, 'yyyy-MM-dd');
          const recipe = plannedRecipes[formattedDate];
          const isCurrentMonth = isSameMonth(day, selectedDate);
          
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
              <div className="text-center mb-2">
                <div className="font-semibold">
                  {format(day, viewMode === 'week' ? 'EEEE' : 'EEE', { locale: fr })}
                </div>
                <div className="text-sm text-muted-foreground">
                  {format(day, 'd MMMM', { locale: fr })}
                </div>
                {selectedChildren.length > 0 && (
                  <div className="text-sm font-medium text-primary">
                    {selectedChildren.length === 1 
                      ? selectedChildren[0].name
                      : `${selectedChildren.length} enfants sélectionnés`}
                  </div>
                )}
              </div>
              
              {recipe && (
                <div className="mt-2 space-y-2">
                  <RecipeCard recipe={recipe} compact />
                  {recipe.health_benefits && (
                    <RecipeHealthBenefits benefits={recipe.health_benefits} compact />
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};