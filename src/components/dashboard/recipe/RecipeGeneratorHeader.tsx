import { Button } from "@/components/ui/button";
import { Loader2, ChefHat } from 'lucide-react';
import { MultiChildSelector } from "./MultiChildSelector";
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
  onSelectChildren,
  onGenerateRecipes
}: RecipeGeneratorHeaderProps) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold">Générateur de recettes</h2>
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
      </div>
      <MultiChildSelector 
        onSelectChildren={onSelectChildren}
        selectedChildren={selectedChildren}
        mode="compact"
      />
    </div>
  );
};