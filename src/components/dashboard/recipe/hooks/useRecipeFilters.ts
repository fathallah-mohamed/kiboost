import { useState } from 'react';
import { MealType, Difficulty, RecipeFilters } from '../../types';

export const useRecipeFilters = () => {
  const [mealType, setMealType] = useState<MealType | "all">("all");
  const [maxPrepTime, setMaxPrepTime] = useState(30);
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<RecipeFilters>({});

  const getFilters = () => ({
    mealType,
    maxPrepTime,
    difficulty,
    ...advancedFilters
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
    getFilters
  };
};