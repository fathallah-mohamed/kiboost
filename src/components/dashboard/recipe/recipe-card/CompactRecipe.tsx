import { Clock } from "lucide-react";
import { Recipe } from "../../types";

interface CompactRecipeProps {
  recipe: Recipe;
}

export const CompactRecipe = ({ recipe }: CompactRecipeProps) => {
  return (
    <div className="space-y-2">
      <h4 className="font-medium text-sm">{recipe.name}</h4>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="w-3 h-3" />
        <span>{recipe.preparation_time} min</span>
      </div>
    </div>
  );
};