import { Button } from "@/components/ui/button";
import { RecipeFilters as BasicRecipeFilters } from "./RecipeFilters";
import { AdvancedFilters } from "./AdvancedFilters";
import { MealType, Difficulty, RecipeFilters } from "../types";
import { ChevronDown, ChevronUp } from "lucide-react";

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

      <div className="space-y-4">
        <Button
          variant="outline"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="w-full flex items-center justify-center gap-2"
        >
          {showAdvancedFilters ? (
            <>
              Masquer les filtres avancés
              <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Afficher les filtres avancés
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </Button>

        {showAdvancedFilters && (
          <AdvancedFilters
            filters={advancedFilters}
            onFiltersChange={setAdvancedFilters}
          />
        )}
      </div>
    </>
  );
};