import { Card } from "@/components/ui/card";
import { LoadingOverlay } from "./LoadingOverlay";
import { MultiChildSelector } from "./MultiChildSelector";
import { RecipeGeneratorHeader } from "./RecipeGeneratorHeader";
import { RecipeList } from "./RecipeList";
import { LoadMoreButton } from "./LoadMoreButton";
import { Recipe, ChildProfile } from "../types";

interface RecipeGeneratorContentProps {
  loading: boolean;
  saving: boolean;
  selectedChildren: ChildProfile[];
  setSelectedChildren: (children: ChildProfile[]) => void;
  recipes: Recipe[];
  displayCount: number;
  error: string | null;
  plannedRecipes: { [key: string]: Recipe | null };
  handleGenerateRecipes: () => Promise<void>;
  handleSaveRecipe: (recipe: Recipe) => Promise<void>;
  handleLoadMore: () => void;
}

export const RecipeGeneratorContent = ({
  loading,
  saving,
  selectedChildren,
  setSelectedChildren,
  recipes,
  displayCount,
  error,
  plannedRecipes,
  handleGenerateRecipes,
  handleSaveRecipe,
  handleLoadMore,
}: RecipeGeneratorContentProps) => {
  return (
    <>
      {loading && <LoadingOverlay />}

      <Card className="p-4">
        <MultiChildSelector 
          onSelectChildren={setSelectedChildren}
          selectedChildren={selectedChildren}
          mode="compact"
        />
      </Card>

      <div className="flex justify-end">
        <RecipeGeneratorHeader
          loading={loading || saving}
          selectedChildren={selectedChildren}
          onSelectChildren={setSelectedChildren}
          onGenerateRecipes={handleGenerateRecipes}
        />
      </div>

      <RecipeList
        recipes={recipes.slice(0, displayCount)}
        error={error}
        plannedRecipes={plannedRecipes}
        onSaveRecipe={handleSaveRecipe}
      />

      <LoadMoreButton 
        displayCount={displayCount}
        totalCount={recipes.length}
        onLoadMore={handleLoadMore}
      />
    </>
  );
};