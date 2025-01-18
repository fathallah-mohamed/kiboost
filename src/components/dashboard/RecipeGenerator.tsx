import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ChildProfile, Recipe, MealType, Difficulty, RecipeFilters } from "./types";
import { Card } from "@/components/ui/card";
import { RecipeFilters as BasicRecipeFilters } from "./recipe/RecipeFilters";
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
import { AdvancedFilters } from "./recipe/AdvancedFilters";
import { BackToDashboard } from "./BackToDashboard";
import { Calendar, ShoppingCart } from "lucide-react";

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

  const goToPlanner = () => {
    onSectionChange?.('planner');
  };

  const goToShoppingList = () => {
    onSectionChange?.('shopping');
  };

  return (
    <div className="space-y-6 relative">
      {loading && <LoadingOverlay />}

      <div className="flex justify-between items-center gap-4">
        <BackToDashboard onBack={() => onSectionChange?.('overview')} />
        <div className="flex gap-4">
          <Button onClick={goToPlanner} variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Aller au planificateur
          </Button>
          <Button onClick={goToShoppingList} variant="outline">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Liste de courses
          </Button>
        </div>
      </div>

      <RecipeGeneratorTitle />

      <Card className="p-4">
        <MultiChildSelector 
          onSelectChildren={setSelectedChildren}
          selectedChildren={selectedChildren}
          mode="compact"
        />
      </Card>

      <BasicRecipeFilters
        mealType={mealType}
        setMealType={setMealType}
        maxPrepTime={maxPrepTime}
        setMaxPrepTime={setMaxPrepTime}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
      />

      <Button
        variant="outline"
        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
        className="w-full"
      >
        {showAdvancedFilters ? "Masquer les filtres avancés" : "Afficher les filtres avancés"}
      </Button>

      {showAdvancedFilters && (
        <AdvancedFilters
          filters={advancedFilters}
          onFiltersChange={setAdvancedFilters}
        />
      )}

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
