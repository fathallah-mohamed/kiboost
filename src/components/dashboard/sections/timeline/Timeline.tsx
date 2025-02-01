import { Progress } from "@/components/ui/progress";
import { TimelineStep } from "./TimelineStep";
import { ChefHat, Calendar, ShoppingCart, Check, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StepStatus } from "../../types/steps";

interface TimelineProps {
  currentStep: number;
  onSectionChange: (section: string) => void;
}

export const Timeline = ({ currentStep, onSectionChange }: TimelineProps) => {
  const navigate = useNavigate();

  const steps = [
    {
      icon: User,
      title: "Configurer les profils enfants",
      description: "Ajoutez ou modifiez les profils de vos enfants pour des suggestions personnalisées",
      route: "children",
      actionLabel: "Mettre à jour",
    },
    {
      icon: ChefHat,
      title: "Générer des recettes",
      description: "Créez des recettes adaptées à vos enfants",
      route: "generate-recipes",
      actionLabel: "Générer maintenant",
    },
    {
      icon: Calendar,
      title: "Planifier les repas",
      description: "Organisez les repas de la semaine",
      route: "planner",
      actionLabel: "Commencer à planifier",
    },
    {
      icon: ShoppingCart,
      title: "Liste de courses",
      description: "Préparez votre liste de courses",
      route: "shopping",
      actionLabel: "Préparer ma liste",
    },
    {
      icon: Check,
      title: "Valider le planning",
      description: "Finalisez votre planning hebdomadaire",
      route: "view-planner",
      actionLabel: "Finaliser",
    },
  ];

  const getStepStatus = (index: number): StepStatus => {
    // Une étape est complétée uniquement si elle est strictement inférieure à l'étape courante
    if (index < currentStep - 1) return "completed";
    // L'étape courante est "in_progress"
    if (index === currentStep - 1) return "in_progress";
    // Les étapes suivantes sont "not_started"
    return "not_started";
  };

  const progress = Math.round(((currentStep - 1) / steps.length) * 100);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Progression</h3>
          <span className="text-sm text-muted-foreground">
            {progress}% complété
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="space-y-4 relative py-4">
        {steps.map((step, index) => (
          <TimelineStep
            key={step.route}
            icon={step.icon}
            title={step.title}
            description={step.description}
            status={getStepStatus(index)}
            actionLabel={step.actionLabel}
            onAction={() => navigate(`/dashboard/${step.route}`)}
            isLast={index === steps.length - 1}
            disabled={index >= currentStep}
          />
        ))}
      </div>
    </div>
  );
};