import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Recipe, ChildProfile } from '../../types';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth } from 'date-fns';

export const usePlannedRecipes = (
  userId: string,
  selectedDate: Date,
  viewMode: 'week' | 'month',
  selectedChildren: ChildProfile[]
) => {
  const [plannedRecipes, setPlannedRecipes] = useState<{ [key: string]: Recipe }>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const updateLocalPlannedRecipes = (date: string, recipe: Recipe) => {
    setPlannedRecipes(prev => ({
      ...prev,
      [date]: recipe
    }));
  };

  const removePlannedRecipeFromState = (date: string) => {
    setPlannedRecipes(prev => {
      const newState = { ...prev };
      delete newState[date];
      return newState;
    });
  };

  const parseRecipeData = (recipeData: any): Recipe => {
    return {
      ...recipeData,
      ingredients: Array.isArray(recipeData.ingredients) 
        ? recipeData.ingredients 
        : JSON.parse(typeof recipeData.ingredients === 'string' ? recipeData.ingredients : '[]'),
      nutritional_info: typeof recipeData.nutritional_info === 'string'
        ? JSON.parse(recipeData.nutritional_info)
        : recipeData.nutritional_info,
      health_benefits: typeof recipeData.health_benefits === 'string'
        ? JSON.parse(recipeData.health_benefits)
        : recipeData.health_benefits,
      cooking_steps: typeof recipeData.cooking_steps === 'string'
        ? JSON.parse(recipeData.cooking_steps)
        : recipeData.cooking_steps || []
    };
  };

  const fetchPlannedRecipes = async () => {
    setLoading(true);
    try {
      let startDate, endDate;
      
      if (viewMode === 'week') {
        startDate = startOfWeek(selectedDate, { weekStartsOn: 1 });
        endDate = addDays(startDate, 6);
      } else {
        startDate = startOfMonth(selectedDate);
        endDate = endOfMonth(selectedDate);
      }

      const query = supabase
        .from('meal_plans')
        .select('*, recipes(*)')
        .eq('profile_id', userId)
        .gte('date', format(startDate, 'yyyy-MM-dd'))
        .lte('date', format(endDate, 'yyyy-MM-dd'));

      if (selectedChildren.length > 0) {
        query.in('child_id', selectedChildren.map(child => child.id));
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      const plannedRecipesByDate: { [key: string]: Recipe } = {};
      
      data.forEach(plan => {
        if (plan.recipes) {
          plannedRecipesByDate[plan.date] = parseRecipeData(plan.recipes);
        }
      });

      setPlannedRecipes(plannedRecipesByDate);
    } catch (error) {
      console.error('Error fetching planned recipes:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les recettes planifiées",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlannedRecipes();
  }, [selectedDate, viewMode, selectedChildren]);

  return { 
    plannedRecipes, 
    loading, 
    updateLocalPlannedRecipes, 
    fetchPlannedRecipes,
    removePlannedRecipeFromState 
  };
};