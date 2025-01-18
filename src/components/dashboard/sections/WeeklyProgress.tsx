import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface WeeklyProgressProps {
  plannedMeals: number;
  totalMeals: number;
  newRecipes: number;
}

export const WeeklyProgress = ({ 
  plannedMeals, 
  totalMeals, 
  newRecipes 
}: WeeklyProgressProps) => {
  const progress = (plannedMeals / totalMeals) * 100;

  return (
    <Card className="p-6 space-y-6">
      <h3 className="text-lg font-semibold">Progression de la semaine</h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Planification des repas</span>
            <span className="text-primary">{plannedMeals}/{totalMeals} repas</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="flex items-center justify-between text-sm">
          <span>Nouvelles recettes testées</span>
          <span className="text-primary font-medium">{newRecipes}</span>
        </div>
      </div>
    </Card>
  );
};