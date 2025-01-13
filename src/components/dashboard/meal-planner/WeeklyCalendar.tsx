import { Card } from '@/components/ui/card';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, isSameMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Recipe, ChildProfile } from '../types';
import { RecipeCard } from '../recipe/RecipeCard';

interface WeeklyCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  plannedRecipes: { [key: string]: Recipe | null };
  viewMode: 'week' | 'month';
  selectedChild?: ChildProfile | null;
}

export const WeeklyCalendar = ({ 
  selectedDate, 
  onSelectDate, 
  plannedRecipes, 
  viewMode,
  selectedChild 
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

  const days = getDaysToDisplay();
  const gridCols = viewMode === 'week' ? 'md:grid-cols-7' : 'md:grid-cols-7';

  return (
    <div className={`grid grid-cols-1 ${gridCols} gap-4`}>
      {days.map((day) => {
        const formattedDate = format(day, 'yyyy-MM-dd');
        const recipe = plannedRecipes[formattedDate];
        const isCurrentMonth = isSameMonth(day, selectedDate);
        
        return (
          <Card 
            key={day.toString()}
            className={`p-4 cursor-pointer transition-colors hover:bg-secondary/50 ${
              format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                ? 'border-primary border-2'
                : ''
            } ${
              !isCurrentMonth && viewMode === 'month' ? 'opacity-50' : ''
            }`}
            onClick={() => onSelectDate(day)}
          >
            <div className="text-center mb-2">
              <div className="font-semibold">
                {format(day, viewMode === 'week' ? 'EEEE' : 'EEE', { locale: fr })}
              </div>
              <div className="text-sm text-muted-foreground">
                {format(day, 'd MMMM', { locale: fr })}
              </div>
              {selectedChild && (
                <div className="text-sm font-medium text-primary">
                  {selectedChild.name}
                </div>
              )}
            </div>
            
            {recipe && (
              <div className="mt-2">
                <RecipeCard recipe={recipe} compact />
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};
