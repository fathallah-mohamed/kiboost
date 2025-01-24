import { useState } from 'react';
import { MealType, Difficulty, RecipeFilters } from "../../types";

export const useRecipeFilters = () => {
  const [mealType, setMealType] = useState<MealType | "all">("breakfast");
  const [maxPrepTime, setMaxPrepTime] = useState(15);
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("easy");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<RecipeFilters>({
    dietaryPreferences: [],
    excludedAllergens: [],
    maxCost: 15,
    healthBenefits: [],
    season: new Date().getMonth() + 1
  });

  const getFilters = (): RecipeFilters & { mealType: MealType | "all", difficulty: Difficulty | "all" } => ({
    ...advancedFilters,
    mealType,
    maxPrepTime,
    difficulty,
  });

  return {
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
    getFilters,
  };
};