import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Recipe, MealType, Difficulty, ChildProfile, HealthBenefit } from '../../types';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth } from 'date-fns';

export const usePlannedRecipes = (
  userId: string,
  selectedDate: Date,
  viewMode: 'week' | 'month',
  selectedChildren: ChildProfile[]
) => {
  const { toast } = useToast();
  const [plannedRecipes, setPlannedRecipes] = useState<{ [key: string]: Recipe | null }>({});
  const [loading, setLoading] = useState(true);

  const updateLocalPlannedRecipes = (date: string, recipe: Recipe) => {
    setPlannedRecipes(prev => ({
      ...prev,
      [date]: recipe
    }));
  };

  const deduplicateHealthBenefits = (benefits: HealthBenefit[]): HealthBenefit[] => {
    if (!benefits) return [];
    
    const seen = new Set();
    return benefits.filter(benefit => {
      const key = `${benefit.category}-${benefit.description}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  };

  const parseRecipeData = (recipe: any): Recipe => {
    let parsedHealthBenefits: HealthBenefit[] = [];
    
    try {
      if (recipe.health_benefits) {
        parsedHealthBenefits = typeof recipe.health_benefits === 'string'
          ? JSON.parse(recipe.health_benefits)
          : recipe.health_benefits;
      }
    } catch (error) {
      console.error('Error parsing health benefits:', error);
      parsedHealthBenefits = [];
    }

    // Dédupliquer les bienfaits
    parsedHealthBenefits = deduplicateHealthBenefits(parsedHealthBenefits);

    return {
      ...recipe,
      ingredients: typeof recipe.ingredients === 'string'
        ? JSON.parse(recipe.ingredients)
        : recipe.ingredients,
      nutritional_info: typeof recipe.nutritional_info === 'string'
        ? JSON.parse(recipe.nutritional_info)
        : recipe.nutritional_info,
      instructions: Array.isArray(recipe.instructions)
        ? recipe.instructions
        : [recipe.instructions].filter(Boolean),
      meal_type: recipe.meal_type as MealType,
      difficulty: recipe.difficulty as Difficulty,
      health_benefits: parsedHealthBenefits,
      cooking_steps: recipe.cooking_steps
        ? (typeof recipe.cooking_steps === 'string'
          ? JSON.parse(recipe.cooking_steps)
          : recipe.cooking_steps)
        : []
    };
  };

  const fetchPlannedRecipes = async () => {
    try {
      let dates: string[] = [];
      
      if (viewMode === 'week') {
        const startDate = startOfWeek(selectedDate, { weekStartsOn: 1 });
        dates = Array.from({ length: 7 }, (_, i) => 
          format(addDays(startDate, i), 'yyyy-MM-dd')
        );
      } else {
        const start = startOfMonth(selectedDate);
        const end = endOfMonth(selectedDate);
        const daysInMonth = Array.from(
          { length: end.getDate() },
          (_, i) => format(addDays(start, i), 'yyyy-MM-dd')
        );
        dates = daysInMonth;
      }

      const query = supabase
        .from('meal_plans')
        .select('*, recipes(*)')
        .eq('profile_id', userId)
        .in('date', dates);

      if (selectedChildren.length === 1) {
        query.eq('child_id', selectedChildren[0].id);
      } else if (selectedChildren.length > 1) {
        query.in('child_id', selectedChildren.map(child => child.id));
      }

      const { data, error } = await query;

      if (error) throw error;

      const plannedRecipesByDate: { [key: string]: Recipe | null } = {};
      dates.forEach(date => {
        plannedRecipesByDate[date] = null;
      });

      data.forEach(plan => {
        if (plan.recipes) {
          plannedRecipesByDate[plan.date] = parseRecipeData(plan.recipes);
        }
      });

      setPlannedRecipes(plannedRecipesByDate);
    } catch (error) {
      console.error('Error fetching planned recipes:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger le planning.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlannedRecipes();
  }, [selectedDate, viewMode, selectedChildren]);

  return { plannedRecipes, loading, updateLocalPlannedRecipes };
};