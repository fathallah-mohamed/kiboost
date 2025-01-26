import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { AvailableRecipes } from './meal-planner/AvailableRecipes';
import { WeeklyCalendar } from './meal-planner/WeeklyCalendar';
import { useMealPlanner } from './meal-planner/hooks/useMealPlanner';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CalendarDays, CalendarRange } from "lucide-react";
import { MultiChildSelector } from './recipe/MultiChildSelector';
import { ChildProfile } from './types';
import { BackToDashboard } from './BackToDashboard';
import { StepNavigation } from './navigation/StepNavigation';
import { format } from 'date-fns';

interface MealPlannerProps {
  userId: string;
  onSectionChange?: (section: string) => void;
}

export const MealPlanner = ({ userId, onSectionChange }: MealPlannerProps) => {
  const [selectedChildren, setSelectedChildren] = useState<ChildProfile[]>([]);
  
  const {
    selectedDate,
    setSelectedDate,
    recipes,
    plannedRecipes,
    loading,
    planningRecipe,
    planRecipe,
    removeRecipe,
    viewMode,
    setViewMode
  } = useMealPlanner(userId, selectedChildren);

  const handleRemoveRecipe = (date: string, childId: string) => {
    removeRecipe(date, childId);
  };

  return (
    <div className="space-y-6">
      <BackToDashboard onBack={() => onSectionChange?.('overview')} />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold">Planificateur de repas</h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
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

      <Card className="p-4">
        <MultiChildSelector 
          onSelectChildren={setSelectedChildren}
          selectedChildren={selectedChildren}
        />
      </Card>
      
      <div className="grid grid-cols-1 gap-6">
        <Card className="p-4">
          <WeeklyCalendar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            plannedRecipes={plannedRecipes}
            viewMode={viewMode}
            selectedChildren={selectedChildren}
            onRemoveRecipe={handleRemoveRecipe}
          />
        </Card>

        <AvailableRecipes
          recipes={recipes}
          loading={loading}
          planningRecipe={planningRecipe}
          onPlanRecipe={(recipe) => planRecipe(recipe, selectedChildren)}
        />

        <StepNavigation
          previousStep={{
            label: "Retour aux recettes",
            route: "/dashboard/generate-recipes"
          }}
          nextStep={{
            label: "Liste de courses",
            route: "/dashboard/shopping"
          }}
        />
      </div>
    </div>
  );
};