import { Button } from "@/components/ui/button";
import { Loader2, ChefHat } from 'lucide-react';
import { ChildSelector } from "./ChildSelector";
import { ChildProfile } from "../types";

interface RecipeGeneratorHeaderProps {
  loading: boolean;
  selectedChild: ChildProfile | null;
  onSelectChild: (child: ChildProfile | null) => void;
  onGenerateRecipes: () => void;
}

export const RecipeGeneratorHeader = ({
  loading,
  selectedChild,
  onSelectChild,
  onGenerateRecipes
}: RecipeGeneratorHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <h2 className="text-2xl font-bold">Générateur de recettes</h2>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
        <div className="w-full sm:w-64">
          <ChildSelector 
            onSelectChild={onSelectChild}
            selectedChild={selectedChild}
          />
        </div>
        <Button 
          onClick={onGenerateRecipes} 
          disabled={loading || !selectedChild}
          className="whitespace-nowrap"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <ChefHat className="w-4 h-4 mr-2" />
          )}
          Générer des recettes
        </Button>
      </div>
    </div>
  );
};