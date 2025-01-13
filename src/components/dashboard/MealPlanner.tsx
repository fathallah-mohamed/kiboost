import { Card } from '@/components/ui/card';
import { AvailableRecipes } from './meal-planner/AvailableRecipes';
import { WeeklyCalendar } from './meal-planner/WeeklyCalendar';
import { useMealPlanner } from './meal-planner/useMealPlanner';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CalendarDays, CalendarRange } from "lucide-react";
import { ChildSelector } from './recipe/ChildSelector';
import { ChildProfile } from './types';
import { useState } from 'react';

interface MealPlannerProps {
  userId: string;
}

export const MealPlanner = ({ userId }: MealPlannerProps) => {
  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(null);
  
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
  } = useMealPlanner(userId, selectedChild);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold">Planificateur de repas</h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
          <div className="w-full sm:w-64">
            <ChildSelector 
              onSelectChild={setSelectedChild}
              selectedChild={selectedChild}
            />
          </div>
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
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <Card className="p-4">
          <WeeklyCalendar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            plannedRecipes={plannedRecipes}
            viewMode={viewMode}
            selectedChild={selectedChild}
          />
        </Card>

        <AvailableRecipes
          recipes={recipes}
          loading={loading}
          planningRecipe={planningRecipe}
          onPlanRecipe={(recipe) => planRecipe(recipe, selectedChild)}
        />
      </div>
    </div>
  );
};