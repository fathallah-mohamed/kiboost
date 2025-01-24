import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ChefHat,
  Calendar,
  ShoppingCart,
  Check,
  User,
  ArrowRight,
  Lock,
  CheckCircle,
  Circle,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface ProgressStepsProps {
  onSectionChange: (section: string) => void;
}

type StepStatus = "completed" | "in-progress" | "locked";

interface Step {
  id: string;
  label: string;
  icon: any;
  status: StepStatus;
  action: string;
  route: string;
  description: string;
  feedback: string;
  warning?: string;
}

export const ProgressSteps = ({ onSectionChange }: ProgressStepsProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [hasChildren, setHasChildren] = useState(false);
  const [hasRecipes, setHasRecipes] = useState(false);
  const [hasMealPlans, setHasMealPlans] = useState(false);
  const [hasShoppingList, setHasShoppingList] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkCompletedSteps();
  }, []);

  const checkCompletedSteps = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;

      // Check for children profiles
      const { data: children } = await supabase
        .from('children_profiles')
        .select('id')
        .eq('profile_id', session.session.user.id);
      setHasChildren(children && children.length > 0);

      // Check for generated recipes
      const { data: recipes } = await supabase
        .from('recipes')
        .select('id')
        .eq('profile_id', session.session.user.id)
        .eq('is_generated', true);
      setHasRecipes(recipes && recipes.length > 0);

      // Check for meal plans
      const { data: mealPlans } = await supabase
        .from('meal_plans')
        .select('id')
        .eq('profile_id', session.session.user.id);
      setHasMealPlans(mealPlans && mealPlans.length > 0);

      // Check for shopping list
      const { data: shoppingLists } = await supabase
        .from('shopping_lists')
        .select('id')
        .eq('profile_id', session.session.user.id);
      setHasShoppingList(shoppingLists && shoppingLists.length > 0);

      // Update current step based on progress
      if (hasChildren) setCurrentStep(prev => Math.max(prev, 2));
      if (hasRecipes) setCurrentStep(prev => Math.max(prev, 3));
      if (hasMealPlans) setCurrentStep(prev => Math.max(prev, 4));
      if (hasShoppingList) setCurrentStep(prev => Math.max(prev, 5));
    } catch (error) {
      console.error('Error checking completed steps:', error);
      toast.error("Erreur lors de la vérification des étapes");
    }
  };
  
  const getStepStatus = (stepNumber: number): StepStatus => {
    if (stepNumber === 1 && hasChildren) return "completed";
    if (stepNumber === 2 && hasRecipes) return "completed";
    if (stepNumber === 3 && hasMealPlans) return "completed";
    if (stepNumber === 4 && hasShoppingList) return "completed";
    if (stepNumber === 5 && hasShoppingList && hasMealPlans) return "completed";
    
    if (stepNumber < currentStep) return "completed";
    if (stepNumber === currentStep) return "in-progress";
    return "locked";
  };

  const steps: Step[] = [
    {
      id: "profiles",
      label: "Configurer les profils enfants",
      icon: User,
      status: getStepStatus(1),
      action: hasChildren ? "Mettre à jour" : "Configurer",
      route: "children",
      description: "Ajoutez ou modifiez les profils de vos enfants",
      feedback: "Profils enfants configurés avec succès !",
    },
    {
      id: "recipes",
      label: "Générer des recettes",
      icon: ChefHat,
      status: getStepStatus(2),
      action: hasRecipes ? "Voir les recettes" : "Générer maintenant",
      route: "recipes",
      description: "Créez des recettes adaptées à vos enfants",
      feedback: "Recettes générées avec succès !",
    },
    {
      id: "planning",
      label: "Planifier les repas",
      icon: Calendar,
      status: getStepStatus(3),
      action: "Commencer à planifier",
      route: "planner",
      description: "Organisez les repas de la semaine",
      feedback: "Planning des repas créé !",
      warning: "Générez d'abord des recettes",
    },
    {
      id: "shopping",
      label: "Liste de courses",
      icon: ShoppingCart,
      status: getStepStatus(4),
      action: "Préparer ma liste",
      route: "shopping",
      description: "Préparez votre liste de courses",
      feedback: "Liste de courses générée !",
      warning: "Planifiez d'abord vos repas",
    },
    {
      id: "validate",
      label: "Valider le planning",
      icon: Check,
      status: getStepStatus(5),
      action: "Finaliser",
      route: "view-planner",
      description: "Finalisez votre planning hebdomadaire",
      feedback: "Planning validé !",
      warning: "Complétez d'abord les étapes précédentes",
    },
  ];

  const getProgress = () => {
    const completed = steps.filter(step => step.status === "completed").length;
    return (completed / steps.length) * 100;
  };

  const getStatusIcon = (status: StepStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case "in-progress":
        return <Circle className="w-6 h-6 text-blue-500 animate-pulse" />;
      case "locked":
        return <Lock className="w-6 h-6 text-gray-300" />;
    }
  };

  const handleStepClick = (step: Step) => {
    if (step.status === "locked") {
      toast.error("Terminez l'étape précédente pour continuer");
      return;
    }

    onSectionChange(step.route);
    toast.success(step.feedback);

    if (step.status === "in-progress") {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleNextStep = () => {
    const nextStep = steps[currentStep];
    if (nextStep) {
      handleStepClick(nextStep);
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Progression</h3>
          <span className="text-sm text-muted-foreground">
            {Math.round(getProgress())}% complété
          </span>
        </div>
        <Progress value={getProgress()} className="h-2" />
      </div>

      <div className="grid gap-4">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className="relative"
          >
            {index < steps.length - 1 && (
              <div className="absolute left-[1.4rem] top-[3rem] bottom-[-1rem] w-0.5 bg-gray-200" />
            )}
            <div
              className={cn(
                "flex items-center justify-between p-4 rounded-lg border animate-fade-in hover:shadow-md transition-all",
                step.status === "locked" ? "opacity-50" : "hover:scale-[1.01]",
                step.status === "completed" ? "bg-green-50" : "bg-white",
                step.status === "in-progress" ? "bg-blue-50" : ""
              )}
            >
              <div className="flex items-center gap-4">
                {getStatusIcon(step.status)}
                <div>
                  <p className="font-medium">{step.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
              <Button
                variant={step.status === "completed" ? "outline" : "default"}
                onClick={() => handleStepClick(step)}
                className="gap-2 group"
                disabled={step.status === "locked"}
              >
                <step.icon className="w-4 h-4" />
                {step.action}
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {currentStep < steps.length && (
        <div className="flex justify-end">
          <Button onClick={handleNextStep} className="gap-2">
            Passer à l'étape suivante
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </Card>
  );
};