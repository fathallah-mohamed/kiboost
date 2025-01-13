import { Card } from '@/components/ui/card';
import { format, startOfWeek, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Recipe } from '../types';
import { RecipeCard } from '../recipe/RecipeCard';

interface WeeklyCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  plannedRecipes: { [key: string]: Recipe | null };
}

export const WeeklyCalendar = ({ selectedDate, onSelectDate, plannedRecipes }: WeeklyCalendarProps) => {
  const startOfCurrentWeek = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfCurrentWeek, i));

  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
      {weekDays.map((day) => {
        const formattedDate = format(day, 'yyyy-MM-dd');
        const recipe = plannedRecipes[formattedDate];
        
        return (
          <Card 
            key={day.toString()}
            className={`p-4 cursor-pointer transition-colors hover:bg-secondary/50 ${
              format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                ? 'border-primary border-2'
                : ''
            }`}
            onClick={() => onSelectDate(day)}
          >
            <div className="text-center mb-2">
              <div className="font-semibold">
                {format(day, 'EEEE', { locale: fr })}
              </div>
              <div className="text-sm text-muted-foreground">
                {format(day, 'd MMMM', { locale: fr })}
              </div>
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