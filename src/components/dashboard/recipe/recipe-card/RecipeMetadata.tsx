import { Star, Utensils } from "lucide-react";
import { Recipe } from "../../types";

interface RecipeMetadataProps {
  recipe: Recipe;
}

export const RecipeMetadata = ({ recipe }: RecipeMetadataProps) => {
  return (
    <div className="flex items-center gap-4 text-sm text-muted-foreground">
      <span className="flex items-center gap-1">
        <Utensils className="w-4 h-4" />
        {recipe.difficulty}
      </span>
      <span className="flex items-center gap-1">
        <Star className="w-4 h-4" />
        {recipe.meal_type}
      </span>
    </div>
  );
};