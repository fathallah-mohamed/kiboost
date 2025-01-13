import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Recipe, MealType, Difficulty, ChildProfile } from '../types';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';

export const useMealPlanner = (userId: string, selectedChildren: ChildProfile[]) => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [plannedRecipes, setPlannedRecipes] = useState<{ [key: string]: Recipe | null }>({});
  const [loading, setLoading] = useState(true);
  const [planningRecipe, setPlanningRecipe] = useState(false);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  const fetchRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('profile_id', userId);

      if (error) throw error;

      const parsedRecipes: Recipe[] = data?.map(recipe => ({
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
        difficulty: recipe.difficulty as Difficulty
      })) || [];

      const uniqueRecipes = parsedRecipes.filter((recipe, index, self) =>
        index === self.findIndex((r) => r.name === recipe.name)
      );

      setRecipes(uniqueRecipes);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les recettes.",
      });
    }
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
          const recipe = plan.recipes;
          plannedRecipesByDate[plan.date] = {
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
            difficulty: recipe.difficulty as Difficulty
          };
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

  const planRecipe = async (recipe: Recipe, children: ChildProfile[]) => {
    setPlanningRecipe(true);
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      // Delete existing plans for this date for selected children
      await supabase
        .from('meal_plans')
        .delete()
        .eq('profile_id', userId)
        .eq('date', formattedDate)
        .in('child_id', children.map(child => child.id));

      // Create new meal plans for each selected child
      const mealPlans = children.map(child => ({
        profile_id: userId,
        recipe_id: recipe.id,
        date: formattedDate,
        child_id: child.id
      }));

      const { error } = await supabase
        .from('meal_plans')
        .insert(mealPlans);

      if (error) throw error;

      setPlannedRecipes(prev => ({
        ...prev,
        [formattedDate]: recipe
      }));

      toast({
        title: "Recette planifiée",
        description: `La recette a été planifiée pour ${children.length} enfant(s) le ${format(selectedDate, 'dd MMMM yyyy', { locale: fr })}`,
      });
    } catch (error) {
      console.error('Error planning recipe:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de planifier la recette.",
      });
    } finally {
      setPlanningRecipe(false);
    }
  };

  useEffect(() => {
    fetchPlannedRecipes();
  }, [selectedDate, viewMode, selectedChildren]);

  return {
    selectedDate,
    setSelectedDate,
    recipes,
    plannedRecipes,
    loading,
    planningRecipe,
    planRecipe,
    viewMode,
    setViewMode
  };
};