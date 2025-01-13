import { Card } from '@/components/ui/card';
import { AvailableRecipes } from './meal-planner/AvailableRecipes';
import { WeeklyCalendar } from './meal-planner/WeeklyCalendar';
import { useMealPlanner } from './meal-planner/useMealPlanner';

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
    planRecipe
  } = useMealPlanner(userId);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Planificateur de repas</h2>
      
      <div className="grid grid-cols-1 gap-6">
        <Card className="p-4">
          <WeeklyCalendar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            plannedRecipes={plannedRecipes}
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