import { Button } from "@/components/ui/button";
import { RecipeFilters as BasicRecipeFilters } from "./RecipeFilters";
import { AdvancedFilters } from "./AdvancedFilters";
import { MealType, Difficulty, RecipeFilters } from "../types";

interface RecipeFiltersSectionProps {
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

export const RecipeFiltersSection = ({
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
}: RecipeFiltersSectionProps) => {
  return (
    <>
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
    </>
  );
};