import { useState } from 'react';
import { MealType, Difficulty, RecipeFilters } from "../../types";

export const useRecipeFilters = () => {
  const [mealType, setMealType] = useState<MealType | "all">("all");
  const [maxPrepTime, setMaxPrepTime] = useState(60);
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<RecipeFilters>({
    dietaryPreferences: [],
    excludedAllergens: [],
    maxCost: 15,
    healthBenefits: [],
    season: 1
  });

  const getFilters = (): RecipeFilters => ({
    ...advancedFilters,
    mealType: mealType === "all" ? undefined : mealType,
    maxPrepTime,
    difficulty: difficulty === "all" ? undefined : difficulty,
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