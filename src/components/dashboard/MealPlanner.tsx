import { Card } from '@/components/ui/card';
import { AvailableRecipes } from './meal-planner/AvailableRecipes';
import { WeeklyCalendar } from './meal-planner/WeeklyCalendar';
import { useMealPlanner } from './meal-planner/useMealPlanner';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CalendarDays, CalendarRange } from "lucide-react";

interface MealPlannerProps {
  userId: string;
}

export const MealPlanner = ({ userId }: MealPlannerProps) => {
  const {
    selectedDate,
    setSelectedDate,
    recipes,
    plannedRecipes,
    loading,
    planningRecipe,
    planRecipe,
    viewMode,
    setViewMode
  } = useMealPlanner(userId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Planificateur de repas</h2>
        <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as 'week' | 'month')}>
          <ToggleGroupItem value="week" aria-label="Vue semaine">
            <CalendarDays className="h-4 w-4" />
            <span className="ml-2">Semaine</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="month" aria-label="Vue mois">
            <CalendarRange className="h-4 w-4" />
            <span className="ml-2">Mois</span>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <Card className="p-4">
          <WeeklyCalendar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            plannedRecipes={plannedRecipes}
            viewMode={viewMode}
          />
        </Card>

        <AvailableRecipes
          recipes={recipes}
          loading={loading}
          planningRecipe={planningRecipe}
          onPlanRecipe={planRecipe}
        />
      </div>
    </div>
  );
};