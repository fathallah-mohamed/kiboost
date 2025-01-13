import { Alert, AlertDescription } from "@/components/ui/alert";
import { Recipe } from "../types";
import { RecipeCard } from "./recipe-card/RecipeCard";

interface RecipeListProps {
  recipes: Recipe[];
  error: string | null;
  plannedRecipes: string[];
  onSaveRecipe: (recipe: Recipe) => void;
}

export const RecipeList = ({
  recipes,
  error,
  plannedRecipes,
  onSaveRecipe
}: RecipeListProps) => {
  return (
    <>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {recipes.map((recipe, index) => (
          <RecipeCard
            key={index}
            recipe={recipe}
            isPlanned={plannedRecipes.includes(recipe.id)}
            onAdd={() => onSaveRecipe(recipe)}
          />
        ))}
      </div>
    </>
  );
};