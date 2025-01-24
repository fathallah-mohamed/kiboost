import { Recipe, ChildProfile, RecipeFilters } from '../types';
import { MultiChildSelector } from './MultiChildSelector';
import { RecipeFiltersSection } from './RecipeFiltersSection';
import { RecipeList } from './RecipeList';

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
  mealType: "all" | "breakfast" | "lunch" | "dinner" | "snack";
  setMealType: (type: "all" | "breakfast" | "lunch" | "dinner" | "snack") => void;
  maxPrepTime: number;
  setMaxPrepTime: (time: number) => void;
  difficulty: "all" | "easy" | "medium" | "hard";
  setDifficulty: (difficulty: "all" | "easy" | "medium" | "hard") => void;
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
      <MultiChildSelector 
        onSelectChildren={setSelectedChildren}
        selectedChildren={selectedChildren}
        mode="compact"
      />

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
        <button
          onClick={handleGenerateRecipes}
          disabled={loading || saving || selectedChildren.length === 0}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? 'Génération...' : 'Générer des recettes'}
        </button>
      </div>

      <RecipeList
        recipes={recipes.slice(0, displayCount)}
        error={error}
        plannedRecipes={plannedRecipes}
        onSaveRecipe={handleSaveRecipe}
      />

      {recipes.length > displayCount && (
        <div className="flex justify-center">
          <button
            onClick={handleLoadMore}
            className="px-4 py-2 text-primary hover:bg-primary/10 rounded-md"
          >
            Voir plus de recettes
          </button>
        </div>
      )}
    </div>
  );
};