import { Card } from "@/components/ui/card";
import { LoadingOverlay } from "./LoadingOverlay";
import { MultiChildSelector } from "./MultiChildSelector";
import { RecipeGeneratorHeader } from "./RecipeGeneratorHeader";
import { RecipeList } from "./RecipeList";
import { LoadMoreButton } from "./LoadMoreButton";
import { RecipeFiltersSection } from "./RecipeFiltersSection";
import { Recipe, ChildProfile, RecipeFilters, MealType, Difficulty } from "../types";

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
  mealType: MealType | "all";
  setMealType: (type: MealType | "all") => void;
  maxPrepTime: number;
  setMaxPrepTime: (time: number) => void;
  difficulty: Difficulty | "all";
  setDifficulty: (difficulty: Difficulty | "all") => void;
  showAdvancedFilters: boolean;
  setShowAdvancedFilters: (show: boolean) => void;
  advancedFilters: RecipeFilters;
  setAdvancedFilters: (filters: RecipeFilters) => void;
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
  mealType,
  setMealType,
  maxPrepTime,
  setMaxPrepTime,
  difficulty,
  setDifficulty,
  showAdvancedFilters,
  setShowAdvancedFilters,
  advancedFilters,
  setAdvancedFilters,
}: RecipeGeneratorContentProps) => {
  return (
    <div className="space-y-6">
      {loading && <LoadingOverlay />}

      <Card className="p-4">
        <MultiChildSelector 
          onSelectChildren={setSelectedChildren}
          selectedChildren={selectedChildren}
          mode="compact"
        />
      </Card>

      <RecipeFiltersSection
        mealType={mealType}
        setMealType={setMealType}
        maxPrepTime={maxPrepTime}
        setMaxPrepTime={setMaxPrepTime}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        showAdvancedFilters={showAdvancedFilters}
        setShowAdvancedFilters={setShowAdvancedFilters}
        advancedFilters={advancedFilters}
        setAdvancedFilters={setAdvancedFilters}
      />

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
    </div>
  );
};