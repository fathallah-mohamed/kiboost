import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { AvailableRecipes } from './meal-planner/AvailableRecipes';
import { MealPlannerGrid } from './meal-planner/MealPlannerGrid';
import { useMealPlanner } from './meal-planner/useMealPlanner';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CalendarDays, CalendarRange, Download } from "lucide-react";
import { ChildProfile } from './types';
import { BackToDashboard } from './BackToDashboard';
import { StepNavigation } from './navigation/StepNavigation';
import { ChildrenSelector } from './meal-planner/children/ChildrenSelector';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface MealPlannerProps {
  userId: string;
  onSectionChange?: (section: string) => void;
}

export const MealPlanner = ({ userId, onSectionChange }: MealPlannerProps) => {
  const [selectedChildren, setSelectedChildren] = useState<ChildProfile[]>([]);
  const { toast } = useToast();
  
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
    children,
    loadingChildren
  } = useMealPlanner(userId, selectedChildren);

  const handleDownloadPlan = () => {
    toast({
      title: "Téléchargement du planning",
      description: "Cette fonctionnalité sera bientôt disponible.",
    });
  };

  const handlePlanMeal = (date: string, childId: string) => {
    // Cette fonction sera utilisée pour ouvrir une modale de sélection de repas
    // Pour l'instant, on garde le comportement existant
  };

  if (loadingChildren) {
    return <div>Chargement des profils...</div>;
  }

  return (
    <div className="space-y-6">
      <BackToDashboard onBack={() => onSectionChange?.('overview')} />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold">Planificateur de repas</h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
          <ToggleGroup 
            type="single" 
            value={viewMode} 
            onValueChange={(value) => value && setViewMode(value as 'week' | 'month')}
          >
            <ToggleGroupItem value="week" aria-label="Vue semaine">
              <CalendarDays className="h-4 w-4" />
              <span className="ml-2">Semaine</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="month" aria-label="Vue mois">
              <CalendarRange className="h-4 w-4" />
              <span className="ml-2">Mois</span>
            </ToggleGroupItem>
          </ToggleGroup>
          <Button
            variant="outline"
            onClick={handleDownloadPlan}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Télécharger le planning
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <ChildrenSelector
          children={children}
          selectedChildren={selectedChildren}
          onSelectionChange={setSelectedChildren}
        />
      </Card>
      
      <div className="grid grid-cols-1 gap-6">
        <MealPlannerGrid
          selectedDate={selectedDate}
          plannedRecipes={plannedRecipes}
          selectedChildren={selectedChildren}
          onPlanMeal={handlePlanMeal}
          onRemoveRecipe={removeRecipe}
        />

        <AvailableRecipes
          recipes={recipes}
          loading={loading}
          planningRecipe={planningRecipe}
          onPlanRecipe={(recipe) => planRecipe(recipe, selectedChildren)}
          selectedChildren={selectedChildren}
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