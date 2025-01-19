import { useState, useEffect } from 'react';
import { useRecipes } from './hooks/useRecipes';
import { usePlannedRecipes } from './hooks/usePlannedRecipes';
import { useRecipePlanning } from './hooks/useRecipePlanning';
import { Recipe, ChildProfile } from '../types';
import { format } from 'date-fns';

export const useMealPlanner = (userId: string, selectedChildren: ChildProfile[]) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  const { recipes: availableRecipes, loading: recipesLoading, clearRecipes } = useRecipes(userId);
  const { 
    plannedRecipes, 
    loading: plannedRecipesLoading, 
    updateLocalPlannedRecipes 
  } = usePlannedRecipes(
    userId,
    selectedDate,
    viewMode,
    selectedChildren
  );
  const { planRecipe, saving } = useRecipePlanning();

  const loading = recipesLoading || plannedRecipesLoading;

  // Force refresh on mount only
  useEffect(() => {
    clearRecipes();
  }, []);

  const handlePlanRecipe = async (recipe: Recipe, children: ChildProfile[]) => {
    await planRecipe(recipe, children, selectedDate, userId);
    
    // Mettre à jour le state local immédiatement
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    updateLocalPlannedRecipes(formattedDate, recipe);
  };

  return {
    selectedDate,
    setSelectedDate,
    recipes: availableRecipes,
    plannedRecipes,
    loading,
    planningRecipe: saving,
    planRecipe: handlePlanRecipe,
    viewMode,
    setViewMode
  };
};