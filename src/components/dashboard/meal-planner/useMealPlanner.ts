import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Recipe, MealType, Difficulty } from '../types';
import { format, startOfWeek, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';

export const useMealPlanner = (userId: string) => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [plannedRecipes, setPlannedRecipes] = useState<{ [key: string]: Recipe | null }>({});
  const [loading, setLoading] = useState(true);
  const [planningRecipe, setPlanningRecipe] = useState(false);

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

      setRecipes(parsedRecipes);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les recettes.",
      });
    }
  };

  const fetchWeeklyPlannedRecipes = async () => {
    try {
      const startDate = startOfWeek(selectedDate, { weekStartsOn: 1 });
      const dates = Array.from({ length: 7 }, (_, i) => 
        format(addDays(startDate, i), 'yyyy-MM-dd')
      );

      const { data, error } = await supabase
        .from('meal_plans')
        .select('*, recipes(*)')
        .eq('profile_id', userId)
        .in('date', dates);

      if (error) throw error;

      const plannedRecipesByDate: { [key: string]: Recipe | null } = {};
      dates.forEach(date => {
        plannedRecipesByDate[date] = null;
      });

      data.forEach(plan => {
        if (plan.recipes) {
          const recipe = plan.recipes;
          const parsedRecipe: Recipe = {
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
          plannedRecipesByDate[plan.date] = parsedRecipe;
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

  const planRecipe = async (recipe: Recipe) => {
    setPlanningRecipe(true);
    try {
      await supabase
        .from('meal_plans')
        .delete()
        .eq('profile_id', userId)
        .eq('date', format(selectedDate, 'yyyy-MM-dd'));

      const { error } = await supabase
        .from('meal_plans')
        .insert({
          profile_id: userId,
          recipe_id: recipe.id,
          date: format(selectedDate, 'yyyy-MM-dd'),
        });

      if (error) throw error;

      setPlannedRecipes(prev => ({
        ...prev,
        [format(selectedDate, 'yyyy-MM-dd')]: recipe
      }));

      toast({
        title: "Planification réussie",
        description: `La recette a été planifiée pour le ${format(selectedDate, 'dd MMMM yyyy', { locale: fr })}`,
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
    fetchRecipes();
  }, []);

  useEffect(() => {
    fetchWeeklyPlannedRecipes();
  }, [selectedDate]);

  return {
    selectedDate,
    setSelectedDate,
    recipes,
    plannedRecipes,
    loading,
    planningRecipe,
    planRecipe
  };
};