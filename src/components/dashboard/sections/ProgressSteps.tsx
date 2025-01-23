import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  Circle,
  User,
  ChefHat,
  Calendar,
  ShoppingCart,
  Check,
  ArrowRight,
  Lock
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ProgressStepsProps {
  onSectionChange: (section: string) => void;
}

export const ProgressSteps = ({ onSectionChange }: ProgressStepsProps) => {
  const navigate = useNavigate();
  
  const steps = [
    {
      id: "profiles",
      label: "Configurer les profils enfants",
      icon: User,
      status: "completed" as const,
      action: "Mettre à jour",
      route: "children",
      description: "Ajoutez ou modifiez les profils de vos enfants",
      feedback: "Profils enfants configurés avec succès !",
    },
    {
      id: "recipes",
      label: "Générer des recettes",
      icon: ChefHat,
      status: "in-progress" as const,
      action: "Générer maintenant",
      route: "recipes",
      description: "Créez des recettes adaptées à vos enfants",
      feedback: "Recettes générées avec succès !",
    },
    {
      id: "planning",
      label: "Planifier les repas",
      icon: Calendar,
      status: "locked" as const,
      action: "Commencer à planifier",
      route: "planner",
      description: "Organisez les repas de la semaine",
      feedback: "Planning de la semaine complété !",
      requiresPrevious: true,
    },
    {
      id: "shopping",
      label: "Liste de courses",
      icon: ShoppingCart,
      status: "locked" as const,
      action: "Préparer ma liste",
      route: "shopping",
      description: "Préparez votre liste de courses",
      feedback: "Liste de courses générée !",
      requiresPrevious: true,
    },
    {
      id: "validate",
      label: "Valider le planning",
      icon: Check,
      status: "locked" as const,
      action: "Finaliser",
      route: "view-planner",
      description: "Finalisez votre planning hebdomadaire",
      feedback: "Planning validé, bonne semaine !",
      requiresPrevious: true,
    }
  ];

  const getProgress = () => {
    const completed = steps.filter(step => step.status === "completed").length;
    return (completed / steps.length) * 100;
  };

  const getStatusIcon = (status: "completed" | "in-progress" | "locked") => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case "in-progress":
        return <Circle className="w-6 h-6 text-blue-500 animate-pulse" />;
      case "locked":
        return <Lock className="w-6 h-6 text-gray-300" />;
    }
  };

  const handleStepClick = (step: typeof steps[0]) => {
    if (step.status === "locked") {
      toast.error("Terminez l'étape précédente pour continuer");
      return;
    }

    onSectionChange(step.route);
    toast.success(step.feedback);
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
    </Card>
  );
};