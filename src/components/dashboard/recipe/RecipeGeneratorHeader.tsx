import { Button } from "@/components/ui/button";
import { Loader2, ChefHat } from 'lucide-react';
import { ChildProfile } from "../types";

interface RecipeGeneratorHeaderProps {
  loading: boolean;
  selectedChildren: ChildProfile[];
  onSelectChildren: (children: ChildProfile[]) => void;
  onGenerateRecipes: () => void;
}

export const RecipeGeneratorHeader = ({
  loading,
  selectedChildren,
  onGenerateRecipes
}: RecipeGeneratorHeaderProps) => {
  return (
    <Button 
      onClick={onGenerateRecipes} 
      disabled={loading || selectedChildren.length === 0}
      className="whitespace-nowrap"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <ChefHat className="w-4 h-4 mr-2" />
      )}
      Générer des recettes
    </Button>
  );
};