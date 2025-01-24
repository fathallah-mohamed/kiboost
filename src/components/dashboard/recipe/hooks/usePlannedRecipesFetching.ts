import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Recipe } from '../../types';
import { toast } from 'sonner';

export const usePlannedRecipesFetching = () => {
  const [plannedRecipes, setPlannedRecipes] = useState<{ [key: string]: Recipe | null }>({});
  const [loading, setLoading] = useState(true);

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
        .select('recipe_id')
        .eq('profile_id', session.session.user.id)
        .gte('date', today);

      if (mealPlansError) throw mealPlansError;

      const recipeIds = mealPlans.map(plan => plan.recipe_id);
      
      if (recipeIds.length === 0) {
        setPlannedRecipes({});
        return;
      }

      const { data: recipes, error: recipesError } = await supabase
        .from('recipes')
        .select('*')
        .in('id', recipeIds);

      if (recipesError) throw recipesError;

      const plannedRecipesMap = recipes.reduce((acc, recipe) => {
        acc[recipe.id] = {
          ...recipe,
          instructions: recipe.instructions.split('\n'),
          ingredients: recipe.ingredients,
          nutritional_info: recipe.nutritional_info,
          health_benefits: recipe.health_benefits || []
        };
        return acc;
      }, {} as { [key: string]: Recipe });

      setPlannedRecipes(plannedRecipesMap);
    } catch (error) {
      console.error('Error fetching planned recipes:', error);
      toast.error("Erreur lors du chargement des recettes planifiées");
    } finally {
      setLoading(false);
    }
  };

  return { plannedRecipes, loading, fetchPlannedRecipes };
};