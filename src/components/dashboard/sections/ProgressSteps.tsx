import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, User, ChefHat, Calendar, ShoppingCart, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Step {
  id: string;
  label: string;
  icon: React.ElementType;
  status: "todo" | "in-progress" | "completed";
  action: string;
  route: string;
}

export const ProgressSteps = () => {
  const navigate = useNavigate();
  
  const steps: Step[] = [
    {
      id: "profiles",
      label: "Configurer les profils enfants",
      icon: User,
      status: "completed",
      action: "Mettre à jour",
      route: "children"
    },
    {
      id: "recipes",
      label: "Générer des recettes",
      icon: ChefHat,
      status: "in-progress",
      action: "Générer",
      route: "recipes"
    },
    {
      id: "planning",
      label: "Planifier les repas",
      icon: Calendar,
      status: "todo",
      action: "Planifier",
      route: "planner"
    },
    {
      id: "shopping",
      label: "Liste de courses",
      icon: ShoppingCart,
      status: "todo",
      action: "Générer",
      route: "shopping"
    },
    {
      id: "validate",
      label: "Valider le planning",
      icon: Check,
      status: "todo",
      action: "Valider",
      route: "view-planner"
    }
  ];

  const getProgress = () => {
    const completed = steps.filter(step => step.status === "completed").length;
    return (completed / steps.length) * 100;
  };

  const getStatusIcon = (status: Step["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case "in-progress":
        return <Circle className="w-6 h-6 text-blue-500 animate-pulse" />;
      default:
        return <Circle className="w-6 h-6 text-gray-300" />;
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Progression</h3>
        <Progress value={getProgress()} className="h-2" />
      </div>

      <div className="grid gap-4">
        {steps.map((step) => (
          <div
            key={step.id}
            className="flex items-center justify-between p-4 bg-white rounded-lg border animate-fade-in"
          >
            <div className="flex items-center gap-4">
              {getStatusIcon(step.status)}
              <div>
                <p className="font-medium">{step.label}</p>
                <p className="text-sm text-muted-foreground">
                  {step.status === "completed" ? "Terminé" : 
                   step.status === "in-progress" ? "En cours" : "À faire"}
                </p>
              </div>
            </div>
            <Button
              variant={step.status === "completed" ? "outline" : "default"}
              onClick={() => navigate(step.route)}
              className="whitespace-nowrap"
            >
              <step.icon className="w-4 h-4 mr-2" />
              {step.action}
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
};