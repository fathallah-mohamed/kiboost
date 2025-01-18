import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Recipe } from '../../types';

export const usePlannedRecipesFetching = (selectedChildren: any[]) => {
  const [plannedRecipes, setPlannedRecipes] = useState<{ [key: string]: Recipe | null }>({});

  const fetchPlannedRecipes = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const query = supabase
        .from('meal_plans')
        .select('*, recipes(*)')
        .eq('profile_id', session.user.id);

      if (selectedChildren.length > 0) {
        query.in('child_id', selectedChildren.map(child => child.id));
      }

      const { data, error } = await query;

      if (error) throw error;

      const plannedRecipeMap: { [key: string]: Recipe | null } = {};
      data.forEach(plan => {
        if (plan.recipes) {
          plannedRecipeMap[plan.date] = plan.recipes as Recipe;
        }
      });

      setPlannedRecipes(plannedRecipeMap);
    } catch (error) {
      console.error('Error fetching planned recipes:', error);
    }
  };

  useEffect(() => {
    fetchPlannedRecipes();
  }, [selectedChildren]);

  return { plannedRecipes, fetchPlannedRecipes };
};