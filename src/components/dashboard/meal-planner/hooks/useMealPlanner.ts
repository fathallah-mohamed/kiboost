import { useState } from 'react';
import { Recipe, ChildProfile } from '../../types';
import { useRecipes } from '../../recipe/hooks/useRecipes';
import { usePlannedRecipes } from './usePlannedRecipes';
import { useRecipePlanning } from './useRecipePlanning';

export const useMealPlanner = (userId: string, selectedChildren: ChildProfile[]) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const { recipes, loading } = useRecipes(userId);
  const { plannedRecipes, updatePlannedRecipes, removePlannedRecipe } = usePlannedRecipes(userId);
  const { planningRecipe, planRecipe: planSingleRecipe } = useRecipePlanning();

  const updateLocalPlannedRecipes = (recipe: Recipe, date: Date, childId: string) => {
    const key = `${date.toISOString().split('T')[0]}-${childId}`;
    updatePlannedRecipes(key, recipe, childId);
  };

  const removePlannedRecipeFromState = (date: Date, childId: string) => {
    const key = `${date.toISOString().split('T')[0]}-${childId}`;
    removePlannedRecipe(key);
  };

  const planRecipe = async (recipe: Recipe, children: ChildProfile[]) => {
    for (const child of children) {
      try {
        await planSingleRecipe(recipe, selectedDate, child.id);
        updateLocalPlannedRecipes(recipe, selectedDate, child.id);
      } catch (error) {
        console.error('Error planning recipe:', error);
      }
    }
  };

  const removeRecipe = async (date: Date, childId: string) => {
    try {
      removePlannedRecipeFromState(date, childId);
    } catch (error) {
      console.error('Error removing recipe:', error);
    }
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