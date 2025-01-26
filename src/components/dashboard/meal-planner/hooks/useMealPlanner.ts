import { useState } from 'react';
import { Recipe, ChildProfile } from '../../types';
import { useRecipes } from '../../recipe/hooks/useRecipes';
import { usePlannedRecipes } from './usePlannedRecipes';
import { useRecipePlanning } from './useRecipePlanning';
import { format } from 'date-fns';

export const useMealPlanner = (userId: string, selectedChildren: ChildProfile[]) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const { recipes, loading: recipesLoading } = useRecipes(userId);
  const { 
    plannedRecipes, 
    loading: plannedRecipesLoading,
    updateLocalPlannedRecipes,
    removePlannedRecipeFromState
  } = usePlannedRecipes(userId, selectedDate, viewMode, selectedChildren);
  const { planRecipe: planSingleRecipe, saving: planningRecipe } = useRecipePlanning();

  const loading = recipesLoading || plannedRecipesLoading;

  const planRecipe = async (recipe: Recipe, children: ChildProfile[]) => {
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    for (const child of children) {
      try {
        await planSingleRecipe(recipe, children, selectedDate, userId);
        updateLocalPlannedRecipes(formattedDate, recipe, child.id);
      } catch (error) {
        console.error('Error planning recipe:', error);
      }
    }
  };

  const removeRecipe = (date: string, childId: string) => {
    removePlannedRecipeFromState(date, childId);
  };

  return {
    selectedDate,
    setSelectedDate,
    recipes,
    plannedRecipes,
    loading,
    planningRecipe,
    planRecipe,
    removeRecipe,
    viewMode,
    setViewMode
  };
};