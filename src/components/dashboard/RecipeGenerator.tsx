import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ChildProfile, Recipe, MealType, Difficulty } from "./types";
import { Card } from "@/components/ui/card";
import { RecipeFilters } from "./recipe/RecipeFilters";
import { RecipeGeneratorHeader } from "./recipe/RecipeGeneratorHeader";
import { RecipeList } from "./recipe/RecipeList";
import { MultiChildSelector } from "./recipe/MultiChildSelector";
import { useRecipeGeneration } from "./recipe/useRecipeGeneration";
import { useRecipeSaving } from "./recipe/hooks/useRecipeSaving";
import { usePlannedRecipesFetching } from "./recipe/hooks/usePlannedRecipesFetching";
import { LoadingOverlay } from "./recipe/LoadingOverlay";
import { RecipeGeneratorTitle } from "./recipe/RecipeGeneratorTitle";
import { LoadMoreButton } from "./recipe/LoadMoreButton";
import { Button } from "@/components/ui/button";

export const RecipeGenerator = () => {
  const [selectedChildren, setSelectedChildren] = useState<ChildProfile[]>([]);
  const [mealType, setMealType] = useState<MealType | "all">("breakfast");
  const [maxPrepTime, setMaxPrepTime] = useState(10);
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("easy");
  const [displayCount, setDisplayCount] = useState(3);
  
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

    setDisplayCount(3); // Reset display count when generating new recipes
    await generateRecipes(selectedChildren[0], {
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
    <div className="space-y-6 relative">
      {loading && <LoadingOverlay />}

      <RecipeGeneratorTitle />

      <Card className="p-4">
        <MultiChildSelector 
          onSelectChildren={setSelectedChildren}
          selectedChildren={selectedChildren}
          mode="compact"
        />
      </Card>

      <RecipeFilters
        mealType={mealType}
        setMealType={setMealType}
        maxPrepTime={maxPrepTime}
        setMaxPrepTime={setMaxPrepTime}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
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

      {recipes.length > displayCount && (
        <div className="flex justify-center mt-6">
          <Button 
            variant="outline"
            onClick={handleLoadMore}
            className="px-6"
          >
            Voir plus de recettes ({displayCount}/{recipes.length})
          </Button>
        </div>
      )}
    </div>
  );
};