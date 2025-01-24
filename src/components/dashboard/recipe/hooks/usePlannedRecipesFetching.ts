import { useState, useEffect } from 'react';
import { Recipe } from '../../types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const usePlannedRecipesFetching = () => {
  const [plannedRecipes, setPlannedRecipes] = useState<{ [key: string]: Recipe | null }>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchPlannedRecipes();
  }, []);

  const fetchPlannedRecipes = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;

      const today = new Date().toISOString().split('T')[0];
      const { data: mealPlans, error: mealPlansError } = await supabase
        .from('meal_plans')
        .select(`
          id,
          recipe_id,
          recipes (
            id,
            name,
            ingredients,
            instructions,
            nutritional_info,
            meal_type,
            preparation_time,
            difficulty,
            servings,
            health_benefits,
            image_url
          )
        `)
        .eq('profile_id', session.session.user.id)
        .gte('date', today);

      if (mealPlansError) throw mealPlansError;

      const plannedRecipesMap: { [key: string]: Recipe | null } = {};
      mealPlans?.forEach((plan) => {
        if (plan.recipes) {
          const recipe = plan.recipes as unknown as Recipe;
          plannedRecipesMap[plan.id] = recipe;
        }
      });

      setPlannedRecipes(plannedRecipesMap);
    } catch (error) {
      console.error('Error fetching planned recipes:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les recettes planifiées.",
      });
    }
  };

  return { plannedRecipes };
};