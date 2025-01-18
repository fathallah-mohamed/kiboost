import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ChildProfile, Recipe, MealType, Difficulty, RecipeFilters } from "./types";
import { RecipeGeneratorTitle } from "./recipe/RecipeGeneratorTitle";
import { RecipeGeneratorLayout } from "./recipe/RecipeGeneratorLayout";
import { RecipeFiltersSection } from "./recipe/RecipeFiltersSection";
import { RecipeGeneratorContent } from "./recipe/RecipeGeneratorContent";
import { useRecipeGeneration } from "./recipe/useRecipeGeneration";
import { useRecipeSaving } from "./recipe/hooks/useRecipeSaving";
import { usePlannedRecipesFetching } from "./recipe/hooks/usePlannedRecipesFetching";

interface RecipeGeneratorProps {
  onSectionChange?: (section: string) => void;
}

export const RecipeGenerator = ({ onSectionChange }: RecipeGeneratorProps) => {
  const [selectedChildren, setSelectedChildren] = useState<ChildProfile[]>([]);
  const [mealType, setMealType] = useState<MealType | "all">("breakfast");
  const [maxPrepTime, setMaxPrepTime] = useState(10);
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("easy");
  const [displayCount, setDisplayCount] = useState(3);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<RecipeFilters>({});
  
  const { toast } = useToast();
  const { loading, recipes, error, generateRecipes } = useRecipeGeneration();
  const { saveRecipe, saving } = useRecipeSaving();
  const { plannedRecipes } = usePlannedRecipesFetching(selectedChildren);

  const handleGenerateRecipes = async () => {
    if (selectedChildren.length === 0) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez sélectionner au moins un enfant.",
      });
      return;
    }

    setDisplayCount(3);
    await generateRecipes(selectedChildren[0], {
      ...advancedFilters,
      mealType: mealType === "all" ? undefined : mealType,
      maxPrepTime,
      difficulty: difficulty === "all" ? undefined : difficulty,
    });
  };

  const handleSaveRecipe = async (recipe: Recipe) => {
    await saveRecipe(recipe, selectedChildren);
  };

  const handleLoadMore = () => {
    setDisplayCount(prev => Math.min(prev + 3, recipes.length));
  };

  return (
    <RecipeGeneratorLayout onSectionChange={onSectionChange!}>
      <RecipeGeneratorTitle />

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
      />
    </RecipeGeneratorLayout>
  );
};