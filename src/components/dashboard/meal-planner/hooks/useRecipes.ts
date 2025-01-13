import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Recipe, MealType, Difficulty } from '../../types';

export const useRecipes = (userId: string) => {
  const { toast } = useToast();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, [userId]);

  return { recipes, loading };
};