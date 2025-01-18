import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ChildrenProfiles } from './ChildrenProfiles';
import { MealPlanner } from './MealPlanner';
import { ShoppingList } from './ShoppingList';
import { RecipeGenerator } from './RecipeGenerator';
import { StatsAndLeftovers } from './statistics/StatsAndLeftovers';
import { ChildProfile } from './types';
import { LeftoversManager } from './leftovers/LeftoversManager';
import { StepProgress } from '../navigation/StepProgress';
import { useLocalStorage } from '@/hooks/use-local-storage';

interface DashboardProps {
  session: Session;
}

export const Dashboard = ({ session }: DashboardProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useLocalStorage<number[]>("completed_steps", []);

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt sur Kiboost !",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la déconnexion.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStepClick = (step: number) => {
    // Vérifier si l'étape précédente est complétée
    if (step > 1 && !completedSteps.includes(step - 1)) {
      toast({
        variant: "destructive",
        title: "Étape verrouillée",
        description: "Veuillez d'abord compléter l'étape précédente.",
      });
      return;
    }
    setCurrentStep(step);
  };

  const completeStep = (step: number) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps([...completedSteps, step]);
    }
  };

  const renderContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="p-6 animate-fade-in">
            <ChildrenProfiles 
              userId={session.user.id} 
              onSelectChild={(child) => {
                setSelectedChild(child);
                if (child) {
                  completeStep(1);
                  toast({
                    title: "Profil sélectionné",
                    description: "Passons à la planification des repas !",
                  });
                }
              }}
            />
          </Card>
        );
      case 2:
        return (
          <Card className="p-6 animate-fade-in">
            <MealPlanner userId={session.user.id} />
          </Card>
        );
      case 3:
        return (
          <Card className="p-6 animate-fade-in">
            <RecipeGenerator />
          </Card>
        );
      case 4:
        return (
          <Card className="p-6 animate-fade-in">
            <ShoppingList userId={session.user.id} />
          </Card>
        );
      case 5:
        return (
          <Card className="p-6 animate-fade-in">
            <LeftoversManager userId={session.user.id} />
          </Card>
        );
      case 6:
        return (
          <Card className="p-6 animate-fade-in">
            <StatsAndLeftovers />
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Tableau de bord</h1>
          <Button onClick={handleSignOut} variant="outline" disabled={loading}>
            {loading ? 'Déconnexion...' : 'Se déconnecter'}
          </Button>
        </div>

        <Card className="mb-8">
          <StepProgress
            currentStep={currentStep}
            onStepClick={handleStepClick}
            completedSteps={completedSteps}
          />
        </Card>

        <div className="space-y-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};