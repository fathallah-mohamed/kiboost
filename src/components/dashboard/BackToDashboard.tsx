import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface BackToDashboardProps {
  onBack?: () => void;
  className?: string;
}

export const BackToDashboard = ({ onBack, className = "" }: BackToDashboardProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't render the button on the recipes page
  if (location.pathname === '/dashboard/recipes') {
    return null;
  }

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/dashboard/recipes');
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleBack}
      className={`mb-4 ${className}`}
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Retour au tableau de bord
    </Button>
  );
};