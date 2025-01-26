import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, AlertCircle, Info } from 'lucide-react';
import { BackToDashboard } from './BackToDashboard';
import { toast } from 'sonner';
import { Timeline } from './sections/timeline/Timeline';
import { useRecipeGeneration } from './recipe/useRecipeGeneration';
import { useSession } from '@supabase/auth-helpers-react';
import { useNavigate } from 'react-router-dom';
import { ChildProfile } from './types';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { QuickPlanDialog } from './recipe/QuickPlanDialog';

interface RecipeGeneratorProps {
  onSectionChange: (section: string) => void;
}

export const RecipeGenerator = ({ onSectionChange }: RecipeGeneratorProps) => {
  const [showQuickPlanDialog, setShowQuickPlanDialog] = useState(false);
  const session = useSession();
  const navigate = useNavigate();
  const { generateRecipes, loading, error } = useRecipeGeneration();

  const handleQuickPlan = async (selectedChildren: ChildProfile[]) => {
    if (selectedChildren.length === 0) {
      toast.error("Veuillez sélectionner au moins un enfant");
      return;
    }

    toast.promise(
      generateRecipes(selectedChildren[0], {}),
      {
        loading: 'Génération de votre planning express...',
        success: () => {
          onSectionChange('planner');
          return 'Planning express généré avec succès !';
        },
        error: 'Une erreur est survenue lors de la génération'
      }
    );
  };

  const handleGenerateRecipes = () => {
    navigate('/dashboard/generate');
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
            onClick={() => setShowQuickPlanDialog(true)}
            size="lg"
            className="whitespace-nowrap group hover:scale-105 transition-all duration-300 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
          >
            <Sparkles className="w-5 h-5 mr-2 group-hover:text-yellow-200" />
            Planning express
          </Button>
        </div>
      </Card>

      <Timeline currentStep={1} onSectionChange={onSectionChange} />

      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Tâches prioritaires</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 border-red-100 border">
            <div className="flex items-start gap-2">
              <p className="text-sm">Vous n'avez pas encore planifié vos repas pour cette semaine</p>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-[200px] text-sm">
                    Générez des recettes adaptées aux besoins de vos enfants pour la semaine
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Button 
              onClick={handleGenerateRecipes}
              className="whitespace-nowrap"
            >
              Générer maintenant
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-orange-50 border-orange-100 border">
            <div className="flex items-start gap-2">
              <p className="text-sm">Votre liste de courses n'est pas à jour</p>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-[200px] text-sm">
                    Mettez à jour votre liste de courses pour la semaine en fonction des recettes sélectionnées
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard/shopping')}
              className="whitespace-nowrap"
            >
              Mettre à jour
            </Button>
          </div>
        </div>
      </Card>

      <QuickPlanDialog
        open={showQuickPlanDialog}
        onOpenChange={setShowQuickPlanDialog}
        onConfirm={handleQuickPlan}
      />
    </div>
  );
};