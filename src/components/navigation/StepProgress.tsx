import { cn } from "@/lib/utils";
import { 
  Calendar, 
  Users, 
  List, 
  BookOpen, 
  Package, 
  ChartBar 
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type Step = {
  id: number;
  title: string;
  icon: typeof Users;
  description: string;
};

const steps: Step[] = [
  {
    id: 1,
    title: "Profils enfants",
    icon: Users,
    description: "Créer ou modifier les profils des enfants"
  },
  {
    id: 2,
    title: "Planification",
    icon: Calendar,
    description: "Planifier les repas de la semaine"
  },
  {
    id: 3,
    title: "Recettes",
    icon: BookOpen,
    description: "Consulter ou ajouter des recettes"
  },
  {
    id: 4,
    title: "Courses",
    icon: List,
    description: "Générer la liste de courses"
  },
  {
    id: 5,
    title: "Restes",
    icon: Package,
    description: "Gérer les restes alimentaires"
  },
  {
    id: 6,
    title: "Statistiques",
    icon: ChartBar,
    description: "Visualiser les statistiques"
  }
];

interface StepProgressProps {
  currentStep: number;
  onStepClick: (step: number) => void;
  completedSteps: number[];
}

export const StepProgress = ({ 
  currentStep, 
  onStepClick,
  completedSteps 
}: StepProgressProps) => {
  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-center min-w-max gap-4 p-4">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = currentStep === step.id;
          
          return (
            <div key={step.id} className="flex items-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <button
                      onClick={() => onStepClick(step.id)}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-lg transition-all duration-200",
                        "hover:bg-accent/50",
                        isCurrent && "bg-accent text-accent-foreground",
                        isCompleted && "text-green-500",
                        !isCompleted && !isCurrent && "text-muted-foreground"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        "border-2 transition-colors duration-200",
                        isCurrent && "border-accent-foreground",
                        isCompleted && "border-green-500",
                        !isCompleted && !isCurrent && "border-muted-foreground"
                      )}>
                        <step.icon className="w-4 h-4" />
                      </div>
                      <span className="hidden md:block font-medium">
                        {step.title}
                      </span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{step.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {index < steps.length - 1 && (
                <div className={cn(
                  "h-[2px] w-8 mx-2",
                  isCompleted ? "bg-green-500" : "bg-muted"
                )} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};