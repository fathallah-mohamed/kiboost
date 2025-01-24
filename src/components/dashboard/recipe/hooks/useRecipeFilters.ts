import { useState } from 'react';
import { FilterMealType, FilterDifficulty, RecipeFilters } from "../../types";

export const useRecipeFilters = () => {
  const [mealType, setMealType] = useState<FilterMealType>("breakfast");
  const [maxPrepTime, setMaxPrepTime] = useState(15);
  const [difficulty, setDifficulty] = useState<FilterDifficulty>("easy");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<RecipeFilters>({
    dietaryPreferences: [],
    excludedAllergens: [],
    maxCost: 15,
    healthBenefits: [],
    season: new Date().getMonth() + 1
  });

  const getFilters = (): RecipeFilters => ({
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