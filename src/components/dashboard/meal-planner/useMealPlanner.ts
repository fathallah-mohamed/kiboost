import { useState } from 'react';
import { useRecipes } from './hooks/useRecipes';
import { usePlannedRecipes } from './hooks/usePlannedRecipes';
import { useRecipePlanning } from './hooks/useRecipePlanning';
import { Recipe, ChildProfile } from '../types';

export const useMealPlanner = (userId: string, selectedChildren: ChildProfile[]) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  const { recipes, loading: recipesLoading } = useRecipes(userId);
  const { plannedRecipes, loading: plannedRecipesLoading } = usePlannedRecipes(
    userId,
    selectedDate,
    viewMode,
    selectedChildren
  );
  const { planRecipe, saving } = useRecipePlanning();

  const loading = recipesLoading || plannedRecipesLoading;

  const handlePlanRecipe = (recipe: Recipe, children: ChildProfile[]) => {
    planRecipe(recipe, children, selectedDate, userId);
  };

  return {
    selectedDate,
    setSelectedDate,
    recipes,
    plannedRecipes,
    loading,
    planningRecipe: saving,
    planRecipe: handlePlanRecipe,
    viewMode,
    setViewMode
  };
};