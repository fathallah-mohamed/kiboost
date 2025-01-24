import { Recipe } from "../../types";
import { RecipeList } from "../RecipeList";
import { LoadMoreButton } from "../LoadMoreButton";

interface ResultsSectionProps {
  recipes: Recipe[];
  displayCount: number;
  error: string | null;
  onSaveRecipe: (recipe: Recipe) => Promise<void>;
  onLoadMore: () => void;
}

export const ResultsSection = ({
  recipes,
  displayCount,
  error,
  onSaveRecipe,
  onLoadMore,
}: ResultsSectionProps) => {
  if (recipes.length === 0) {
    return null;
  }

  return (
    <>
      <RecipeList
        recipes={recipes.slice(0, displayCount)}
        error={error}
        plannedRecipes={{}}
        onSaveRecipe={onSaveRecipe}
      />

      <LoadMoreButton 
        displayCount={displayCount}
        totalCount={recipes.length}
        onLoadMore={onLoadMore}
      />
    </>
  );
};