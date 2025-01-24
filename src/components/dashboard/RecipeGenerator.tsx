import { RecipeGeneratorLayout } from './recipe/RecipeGeneratorLayout';
import { RecipeGeneratorContent } from './recipe/RecipeGeneratorContent';
import { useRecipeGeneration } from './recipe/useRecipeGeneration';
import { useState } from 'react';
import { Recipe, ChildProfile, RecipeFilters, MealType, Difficulty } from './types';
import { useRecipeSaving } from './recipe/hooks/useRecipeSaving';
import { toast } from 'sonner';
import { BackToDashboard } from './BackToDashboard';

interface RecipeGeneratorProps {
  onSectionChange: (section: string) => void;
}

export const RecipeGenerator = ({ onSectionChange }: RecipeGeneratorProps) => {
  const [selectedChildren, setSelectedChildren] = useState<ChildProfile[]>([]);
  const [displayCount, setDisplayCount] = useState(3);
  const [plannedRecipes, setPlannedRecipes] = useState<{ [key: string]: Recipe | null }>({});
  const { recipes, loading, error, generateRecipes } = useRecipeGeneration();
  const { saveRecipe, saving } = useRecipeSaving();

  // États pour les filtres
  const [mealType, setMealType] = useState<MealType | "all">("all");
  const [maxPrepTime, setMaxPrepTime] = useState(60);
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<RecipeFilters>({});

  const handleGenerateRecipes = async () => {
    if (selectedChildren.length === 0) {
      toast.error("Veuillez sélectionner au moins un enfant");
      return;
    }

    const filters: RecipeFilters = {
      ...advancedFilters,
      mealType: mealType === "all" ? undefined : mealType,
      maxPrepTime,
      difficulty: difficulty === "all" ? undefined : difficulty,
    };

    await generateRecipes(selectedChildren[0], filters);
  };

  const handleSaveRecipe = async (recipe: Recipe) => {
    if (selectedChildren.length === 0) {
      toast.error("Veuillez sélectionner au moins un enfant");
      return;
    }
    const savedRecipe = await saveRecipe(recipe, selectedChildren);
    if (savedRecipe) {
      setPlannedRecipes(prev => ({
        ...prev,
        [savedRecipe.id]: savedRecipe
      }));
    }
  };

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 3);
  };

  return (
    <div className="space-y-6">
      <BackToDashboard onBack={() => onSectionChange('categories')} />
      <RecipeGeneratorContent
        loading={loading}
        saving={saving}
        selectedChildren={selectedChildren}
        setSelectedChildren={setSelectedChildren}
        recipes={recipes}
        displayCount={displayCount}
        error={error}
        plannedRecipes={plannedRecipes}
        handleGenerateRecipes={handleGenerateRecipes}
        handleSaveRecipe={handleSaveRecipe}
        handleLoadMore={handleLoadMore}
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
    </div>
  );
};