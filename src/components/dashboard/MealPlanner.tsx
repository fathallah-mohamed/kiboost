import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { AvailableRecipes } from './meal-planner/AvailableRecipes';
import { WeeklyCalendar } from './meal-planner/WeeklyCalendar';
import { useMealPlanner } from './meal-planner/hooks/useMealPlanner';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CalendarDays, CalendarRange, AlertCircle } from "lucide-react";
import { MultiChildSelector } from './recipe/MultiChildSelector';
import { ChildProfile } from './types';
import { BackToDashboard } from './BackToDashboard';
import { StepNavigation } from './navigation/StepNavigation';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Timeline } from '../dashboard/sections/timeline/Timeline';
import { startOfToday, isAfter, startOfDay, format, addDays, startOfWeek, isSameDay } from 'date-fns';

interface MealPlannerProps {
  userId: string;
  onSectionChange?: (section: string) => void;
}

export const MealPlanner = ({ userId, onSectionChange }: MealPlannerProps) => {
  const [selectedChildren, setSelectedChildren] = useState<ChildProfile[]>([]);
  const [currentStep, setCurrentStep] = useState(3);
  const navigate = useNavigate();
  
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
    setViewMode,
    isAutoGenerated,
    validatePlanning
  } = useMealPlanner(userId, selectedChildren);

  const handleRemoveRecipe = async (date: string, childId: string) => {
    await removeRecipe(date, childId);
  };

  const handleValidatePlanning = async () => {
    await validatePlanning();
    navigate('/dashboard/shopping');
  };

  // Vérifie si tous les jours futurs de la semaine sont planifiés
  const checkWeekPlanning = () => {
    if (!selectedChildren.length) return false;

    const today = startOfToday();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const daysToCheck = [];

    // Créer un tableau des jours à vérifier (jours futurs et jour actuel de la semaine)
    for (let i = 0; i < 7; i++) {
      const currentDay = addDays(weekStart, i);
      if (isAfter(startOfDay(currentDay), today) || isSameDay(currentDay, today)) {
        daysToCheck.push(format(currentDay, 'yyyy-MM-dd'));
      }
    }

    // Si aucun jour à vérifier, retourner false
    if (daysToCheck.length === 0) return false;

    // Vérifie si chaque jour futur a une recette planifiée pour chaque enfant
    const allDaysPlanned = daysToCheck.every(date => {
      const dayRecipes = plannedRecipes[date] || {};
      return selectedChildren.every(child => 
        Object.keys(dayRecipes).includes(child.id)
      );
    });

    return allDaysPlanned;
  };

  // Met à jour le statut de l'étape en fonction de la planification
  useEffect(() => {
    const isFullyPlanned = checkWeekPlanning();
    const hasAnyPlanning = Object.keys(plannedRecipes).length > 0;
    
    if (isFullyPlanned) {
      setCurrentStep(4); // Étape terminée
    } else if (hasAnyPlanning) {
      setCurrentStep(3); // En cours
    } else {
      setCurrentStep(2); // Pas commencé
    }
  }, [plannedRecipes, selectedChildren]);

  return (
    <div className="space-y-6">
      <BackToDashboard onBack={() => onSectionChange?.('overview')} />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold">Planificateur de repas</h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
          <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as 'week' | 'month')} className="justify-start">
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

      {isAutoGenerated && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Planning Express</AlertTitle>
          <AlertDescription>
            Ce planning a été généré automatiquement. Vous pouvez le modifier ou le valider directement.
          </AlertDescription>
        </Alert>
      )}

      <Timeline currentStep={currentStep} onSectionChange={onSectionChange} />

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
            isAutoGenerated={isAutoGenerated}
          />
        </Card>

        <AvailableRecipes
          recipes={recipes}
          loading={loading}
          planningRecipe={planningRecipe}
          onPlanRecipe={(recipe) => planRecipe(recipe, selectedChildren)}
        />

        {isAutoGenerated && (
          <div className="flex justify-end gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard/planner')}
            >
              Modifier le planning
            </Button>
            <Button 
              onClick={handleValidatePlanning}
            >
              Valider le planning
            </Button>
          </div>
        )}

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