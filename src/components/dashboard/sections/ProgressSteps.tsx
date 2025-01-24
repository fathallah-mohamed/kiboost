import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import {
  ChefHat,
  Calendar,
  ShoppingCart,
  Check,
  User,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

interface ProgressStepsProps {
  onSectionChange: (section: string) => void;
}

type Step = {
  id: string;
  label: string;
  icon: any;
  action: string;
  route: string;
  description: string;
  feedback: string;
};

export const ProgressSteps = ({ onSectionChange }: ProgressStepsProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();

  const steps: Step[] = [
    {
      id: "profiles",
      label: "Configurer les profils enfants",
      icon: User,
      action: "Mettre à jour",
      route: "children",
      description: "Ajoutez ou modifiez les profils de vos enfants",
      feedback: "Profils enfants configurés avec succès !",
    },
    {
      id: "recipes",
      label: "Générer des recettes",
      icon: ChefHat,
      action: "Générer maintenant",
      route: "generate-recipes",
      description: "Créez des recettes adaptées à vos enfants",
      feedback: "Recettes générées avec succès !",
    },
    {
      id: "planning",
      label: "Planifier les repas",
      icon: Calendar,
      action: "Commencer à planifier",
      route: "planner",
      description: "Organisez les repas de la semaine",
      feedback: "Planning des repas créé !",
    },
    {
      id: "shopping",
      label: "Liste de courses",
      icon: ShoppingCart,
      action: "Préparer ma liste",
      route: "shopping",
      description: "Préparez votre liste de courses",
      feedback: "Liste de courses générée !",
    },
    {
      id: "validate",
      label: "Valider le planning",
      icon: Check,
      action: "Finaliser",
      route: "view-planner",
      description: "Finalisez votre planning hebdomadaire",
      feedback: "Planning validé !",
    },
  ];

  const handleStepClick = (step: Step) => {
    console.log(`Navigating to /dashboard/${step.route}`);
    navigate(`/dashboard/${step.route}`);
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Progression</h3>
          <span className="text-sm text-muted-foreground">
            {Math.round((currentStep / steps.length) * 100)}% complété
          </span>
        </div>
        <Progress value={(currentStep / steps.length) * 100} className="h-2" />
      </div>

      <div className="grid gap-4">
        {steps.map((step, index) => (
          <div key={step.id} className="relative">
            {index < steps.length - 1 && (
              <div className="absolute left-[1.4rem] top-[3rem] bottom-[-1rem] w-0.5 bg-gray-200" />
            )}
            <div
              className={`flex items-center justify-between p-4 rounded-lg border animate-fade-in hover:shadow-md transition-all ${
                index < currentStep ? "bg-green-50" : "bg-white"
              } ${index === currentStep ? "bg-blue-50" : ""}`}
            >
              <div className="flex items-center gap-4">
                <step.icon className="w-6 h-6" />
                <div>
                  <p className="font-medium">{step.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
              <Button onClick={() => handleStepClick(step)} className="gap-2 group">
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
          <Button
            onClick={() => handleStepClick(steps[currentStep])}
            className="gap-2"
          >
            Passer à l'étape suivante
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </Card>
  );
};