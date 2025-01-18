import { Alert, AlertDescription } from "@/components/ui/alert";
import { Recipe } from "../types";
import { RecipeCard } from "./recipe-card/RecipeCard";

interface RecipeListProps {
  recipes: Recipe[];
  error: string | null;
  plannedRecipes: { [key: string]: Recipe | null };
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
        {recipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            isPlanned={Object.keys(plannedRecipes).some(date => plannedRecipes[date]?.id === recipe.id)}
            onAdd={() => onSaveRecipe(recipe)}
          />
        ))}
      </div>
    </>
  );
};