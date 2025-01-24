import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface StepNavigationProps {
  previousStep?: {
    label: string;
    route: string;
  };
  nextStep?: {
    label: string;
    route: string;
  };
}

export const StepNavigation = ({ previousStep, nextStep }: StepNavigationProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center mt-6 border-t pt-4">
      {previousStep ? (
        <Button
          variant="outline"
          onClick={() => navigate(previousStep.route)}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {previousStep.label}
        </Button>
      ) : (
        <div /> {/* Spacer */}
      )}

      {nextStep && (
        <Button
          onClick={() => navigate(nextStep.route)}
          className="gap-2"
        >
          {nextStep.label}
          <ArrowRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};