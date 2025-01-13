import { Card } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { fr } from 'date-fns/locale';
import { AvailableRecipes } from './meal-planner/AvailableRecipes';
import { PlannedRecipe } from './meal-planner/PlannedRecipe';
import { useMealPlanner } from './meal-planner/useMealPlanner';

interface MealPlannerProps {
  userId: string;
}

export const MealPlanner = ({ userId }: MealPlannerProps) => {
  const {
    selectedDate,
    setSelectedDate,
    recipes,
    selectedRecipe,
    loading,
    planningRecipe,
    planRecipe
  } = useMealPlanner(userId);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Planificateur de repas</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Card className="p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
              locale={fr}
            />
          </Card>

          <PlannedRecipe 
            recipe={selectedRecipe} 
            selectedDate={selectedDate}
          />
        </div>

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