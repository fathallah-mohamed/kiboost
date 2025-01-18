import { Button } from "@/components/ui/button";
import { Calendar, ShoppingCart } from "lucide-react";
import { BackToDashboard } from "../BackToDashboard";

interface RecipeGeneratorLayoutProps {
  onSectionChange: (section: string) => void;
  children: React.ReactNode;
}

export const RecipeGeneratorLayout = ({ onSectionChange, children }: RecipeGeneratorLayoutProps) => {
  const goToPlanner = () => {
    onSectionChange('planner');
  };

  const goToShoppingList = () => {
    onSectionChange('shopping');
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center gap-4">
        <BackToDashboard onBack={() => onSectionChange('overview')} />
        <div className="flex gap-4">
          <Button onClick={goToPlanner} variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Aller au planificateur
          </Button>
          <Button onClick={goToShoppingList} variant="outline">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Liste de courses
          </Button>
        </div>
      </div>
      {children}
    </div>
  );
};