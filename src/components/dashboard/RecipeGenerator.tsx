import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ChefHat, Calendar, ShoppingCart, 
  Check, AlertCircle, Sparkles, ArrowRight, Circle
} from 'lucide-react';
import { BackToDashboard } from './BackToDashboard';
import { toast } from 'sonner';
import { ProgressSteps } from './sections/ProgressSteps';
import { useRecipeGeneration } from './recipe/useRecipeGeneration';
import { useSession } from '@supabase/auth-helpers-react';

interface RecipeGeneratorProps {
  onSectionChange: (section: string) => void;
}

export const RecipeGenerator = ({ onSectionChange }: RecipeGeneratorProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const session = useSession();
  const { generateRecipes, loading, error } = useRecipeGeneration();

  const handleQuickPlan = () => {
    console.log('Redirecting to recipes section...');
    onSectionChange('recipes');
  };

  const handleGenerateRecipes = () => {
    console.log('Redirecting to recipe generation...');
    onSectionChange('planner');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <BackToDashboard onBack={() => onSectionChange('categories')} />

      <Card className="p-6 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">
              Bienvenue sur Kiboost 👋
            </h2>
            <p className="text-muted-foreground mt-2">
              Suivez les étapes ci-dessous pour planifier des repas sains pour vos enfants.
            </p>
          </div>
          <Button 
            onClick={handleQuickPlan}
            className="whitespace-nowrap group hover:scale-105 transition-all duration-300"
          >
            <Sparkles className="w-4 h-4 mr-2 group-hover:text-yellow-400" />
            Planning express
          </Button>
        </div>
      </Card>

      <ProgressSteps onSectionChange={onSectionChange} />

      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-primary" />
          Tâches prioritaires
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 border-red-100 border">
            <p className="text-sm">Vous n'avez pas encore planifié vos repas pour cette semaine</p>
            <Button 
              onClick={handleGenerateRecipes}
            >
              Générer maintenant
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-orange-50 border-orange-100 border">
            <p className="text-sm">Votre liste de courses n'est pas à jour</p>
            <Button 
              variant="outline" 
              onClick={() => onSectionChange('shopping')}
            >
              Mettre à jour
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};