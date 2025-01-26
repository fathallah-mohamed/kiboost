import { Button } from "@/components/ui/button";
import { TimelineStep } from "./timeline/TimelineStep";
import { useNavigate } from "react-router-dom";

interface ProgressStepsProps {
  onSectionChange?: (section: string) => void;
}

export const ProgressSteps = ({ onSectionChange }: ProgressStepsProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold">Progression</h3>
          <p className="text-sm text-muted-foreground">
            Suivez les étapes pour planifier vos repas
          </p>
        </div>
        <Button 
          onClick={() => navigate('/dashboard/planner')}
          className="w-full sm:w-auto"
        >
          Commencer à planifier
        </Button>
      </div>

      <div className="space-y-4">
        <TimelineStep
          step={1}
          title="Profils enfants"
          description="Créez les profils de vos enfants"
          status="completed"
          onClick={() => onSectionChange?.('children')}
        />
        <TimelineStep
          step={2}
          title="Générer des recettes"
          description="Générez des recettes adaptées"
          status="completed"
          onClick={() => onSectionChange?.('recipes')}
        />
        <TimelineStep
          step={3}
          title="Planifier les repas"
          description="Organisez votre semaine"
          status="in_progress"
          onClick={() => navigate('/dashboard/planner')}
        />
        <TimelineStep
          step={4}
          title="Liste de courses"
          description="Préparez vos courses"
          status="not_started"
          onClick={() => onSectionChange?.('shopping')}
        />
      </div>
    </div>
  );
};