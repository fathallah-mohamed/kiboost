import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  User, ChefHat, Calendar, ShoppingCart, 
  Check, AlertCircle, Sparkles, ArrowRight, Lock
} from 'lucide-react';
import { BackToDashboard } from './BackToDashboard';
import { toast } from 'sonner';

interface RecipeGeneratorProps {
  onSectionChange: (section: string) => void;
}

export const RecipeGenerator = ({ onSectionChange }: RecipeGeneratorProps) => {
  const progress = 20; // Example progress value

  const handleQuickPlan = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Génération de votre planning express...',
        success: 'Votre planning express est prêt !',
        error: 'Une erreur est survenue',
      }
    );
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
              Bienvenue sur votre tableau de bord Kiboost. Commençons à planifier des repas sains pour vos enfants !
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

      <Card className="p-6 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Progression</h3>
            <span className="text-sm text-muted-foreground">
              {progress}% complété
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-4">
          <div className="relative p-4 rounded-lg border bg-green-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <User className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium">Configurer les profils enfants</p>
                  <p className="text-sm text-muted-foreground">
                    Ajoutez ou modifiez les profils de vos enfants
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={() => onSectionChange('children')}>
                Mettre à jour
              </Button>
            </div>
          </div>

          <div className="relative p-4 rounded-lg border bg-blue-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <ChefHat className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium">Générer des recettes</p>
                  <p className="text-sm text-muted-foreground">
                    Créez des recettes adaptées à vos enfants
                  </p>
                </div>
              </div>
              <Button onClick={() => onSectionChange('recipes')}>
                Générer maintenant
              </Button>
            </div>
          </div>

          <div className="relative p-4 rounded-lg border opacity-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Lock className="w-5 h-5" />
                <div>
                  <p className="font-medium">Planifier les repas</p>
                  <p className="text-sm text-muted-foreground">
                    Organisez les repas de la semaine
                  </p>
                </div>
              </div>
              <Button variant="secondary" disabled>
                Commencer à planifier
              </Button>
            </div>
          </div>

          <div className="relative p-4 rounded-lg border opacity-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Lock className="w-5 h-5" />
                <div>
                  <p className="font-medium">Liste de courses</p>
                  <p className="text-sm text-muted-foreground">
                    Préparez votre liste de courses
                  </p>
                </div>
              </div>
              <Button variant="secondary" disabled>
                Préparer ma liste
              </Button>
            </div>
          </div>

          <div className="relative p-4 rounded-lg border opacity-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Lock className="w-5 h-5" />
                <div>
                  <p className="font-medium">Valider le planning</p>
                  <p className="text-sm text-muted-foreground">
                    Finalisez votre planning hebdomadaire
                  </p>
                </div>
              </div>
              <Button variant="secondary" disabled>
                Finaliser
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-primary" />
          Tâches prioritaires
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 border-red-100 border">
            <p className="text-sm">Vous n'avez pas encore planifié vos repas pour cette semaine</p>
            <Button onClick={() => onSectionChange('planner')}>
              Planifier maintenant
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-orange-50 border-orange-100 border">
            <p className="text-sm">Votre liste de courses n'est pas à jour</p>
            <Button variant="outline" onClick={() => onSectionChange('shopping')}>
              Mettre à jour
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};