import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChildProfile } from '../../types';

export const usePlannedRecipesFetching = (selectedChildren: ChildProfile[]) => {
  const [plannedRecipes, setPlannedRecipes] = useState<string[]>([]);

  const fetchPlannedRecipes = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const query = supabase
        .from('meal_plans')
        .select('recipe_id')
        .eq('profile_id', session.user.id);

      if (selectedChildren.length > 0) {
        query.in('child_id', selectedChildren.map(child => child.id));
      }

      const { data, error } = await query;

      if (error) throw error;
      setPlannedRecipes(data.map(plan => plan.recipe_id));
    } catch (error) {
      console.error('Error fetching planned recipes:', error);
    }
  };

  useEffect(() => {
    fetchPlannedRecipes();
  }, [selectedChildren]);

  return { plannedRecipes, fetchPlannedRecipes };
};