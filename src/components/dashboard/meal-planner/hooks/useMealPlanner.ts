import { useState, useEffect } from 'react';
import { useRecipes } from './useRecipes';
import { usePlannedRecipes } from './usePlannedRecipes';
import { useRecipePlanning } from './useRecipePlanning';
import { Recipe, ChildProfile } from '../../types';
import { format } from 'date-fns';

export const useMealPlanner = (userId: string, selectedChildren: ChildProfile[]) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  const { recipes: availableRecipes, loading: recipesLoading, clearRecipes } = useRecipes(userId);
  const { 
    plannedRecipes, 
    loading: plannedRecipesLoading,
    updateLocalPlannedRecipes,
    fetchPlannedRecipes,
    removePlannedRecipeFromState
  } = usePlannedRecipes(
    userId,
    selectedDate,
    viewMode,
    selectedChildren
  );
  const { planRecipe, removePlannedRecipe, saving } = useRecipePlanning();

  const loading = recipesLoading || plannedRecipesLoading;

  useEffect(() => {
    clearRecipes();
  }, []);

  useEffect(() => {
    fetchPlannedRecipes();
  }, [selectedDate, viewMode, selectedChildren]);

  const handlePlanRecipe = async (recipe: Recipe, children: ChildProfile[]) => {
    await planRecipe(recipe, children, selectedDate, userId);
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    for (const child of children) {
      updateLocalPlannedRecipes(formattedDate, recipe, child.id);
    }
    await fetchPlannedRecipes();
  };

  const handleRemoveRecipe = async (date: string, childId: string) => {
    await removePlannedRecipe(date, childId, userId);
    removePlannedRecipeFromState(date, childId);
    await fetchPlannedRecipes();
  };

  return {
    selectedDate,
    setSelectedDate,
    recipes: availableRecipes,
    plannedRecipes,
    loading,
    planningRecipe: saving,
    planRecipe: handlePlanRecipe,
    removeRecipe: handleRemoveRecipe,
    viewMode,
    setViewMode
  };
};