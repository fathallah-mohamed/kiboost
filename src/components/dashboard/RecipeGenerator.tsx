import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ChildProfile, Recipe, MealType, Difficulty } from "./types";
import { RecipeFilters } from "./recipe/RecipeFilters";
import { RecipeGeneratorHeader } from "./recipe/RecipeGeneratorHeader";
import { RecipeList } from "./recipe/RecipeList";
import { useRecipeGeneration } from "./recipe/useRecipeGeneration";
import { useRecipeSaving } from "./recipe/hooks/useRecipeSaving";
import { usePlannedRecipesFetching } from "./recipe/hooks/usePlannedRecipesFetching";
import { MultiChildSelector } from "./recipe/MultiChildSelector";
import { Card } from "@/components/ui/card";

export const RecipeGenerator = () => {
  const [selectedChildren, setSelectedChildren] = useState<ChildProfile[]>([]);
  const [mealType, setMealType] = useState<MealType | "all">("breakfast");
  const [maxPrepTime, setMaxPrepTime] = useState(10);
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("easy");
  
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

    await generateRecipes(selectedChildren[0], {
      mealType: mealType === "all" ? undefined : mealType,
      maxPrepTime,
      difficulty: difficulty === "all" ? undefined : difficulty,
    });
  };

  const handleSaveRecipe = async (recipe: Recipe) => {
    await saveRecipe(recipe, selectedChildren);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold">Générateur de recettes</h2>
      </div>

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
        recipes={recipes}
        error={error}
        plannedRecipes={plannedRecipes}
        onSaveRecipe={handleSaveRecipe}
      />
    </div>
  );
};