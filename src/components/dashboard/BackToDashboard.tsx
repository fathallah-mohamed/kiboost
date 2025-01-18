import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface BackToDashboardProps {
  onBack: () => void;
}

export const BackToDashboard = ({ onBack }: BackToDashboardProps) => {
  return (
    <Button
      variant="outline"
      onClick={onBack}
      className="mb-4"
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Retour au tableau de bord
    </Button>
  );
};