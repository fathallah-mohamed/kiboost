import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WeeklyCalendar } from './meal-planner/WeeklyCalendar';
import { useMealPlanner } from './meal-planner/hooks/useMealPlanner';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CalendarDays, CalendarRange } from "lucide-react";
import { MultiChildSelector } from './recipe/MultiChildSelector';
import { ChildProfile } from './types';

import { BackToDashboard } from './BackToDashboard';
import { isBefore, startOfWeek } from 'date-fns';

interface WeeklyPlanViewerProps {
  userId: string;
  onSectionChange?: (section: string) => void;
}

export const WeeklyPlanViewer = ({ userId, onSectionChange }: WeeklyPlanViewerProps) => {
  const [selectedChildren, setSelectedChildren] = useState<ChildProfile[]>([]);
  
  const {
    selectedDate,
    setSelectedDate,
    recipes,
    plannedRecipes,
    loading,
    viewMode,
    setViewMode
  } = useMealPlanner(userId, selectedChildren);

  const isWeekPassed = isBefore(startOfWeek(selectedDate), startOfWeek(new Date()));

  return (
    <div className="space-y-6">
      <BackToDashboard onBack={() => onSectionChange?.('overview')} />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold">Planning des repas</h2>
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
            readOnly={isWeekPassed}
          />
        </Card>

        {!isWeekPassed && (
          <div className="text-center">
            <Button 
              variant="outline" 
              onClick={() => onSectionChange?.('planner')}
            >
              Modifier le planning
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
