import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Recipe, ChildProfile } from '../../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const useRecipePlanning = (userId: string) => {
  const { toast } = useToast();
  const [planningRecipe, setPlanningRecipe] = useState(false);

  const planRecipe = async (recipe: Recipe, children: ChildProfile[], date: Date) => {
    setPlanningRecipe(true);
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      // Delete existing plans for this date, meal time, and selected children
      await supabase
        .from('meal_plans')
        .delete()
        .eq('profile_id', userId)
        .eq('date', formattedDate)
        .eq('meal_time', recipe.meal_type)
        .in('child_id', children.map(child => child.id));

      // Create new meal plans for each selected child
      const mealPlans = children.map(child => ({
        profile_id: userId,
        recipe_id: recipe.id,
        date: formattedDate,
        child_id: child.id,
        meal_time: recipe.meal_type || 'dinner' // Ensure meal_time is never null
      }));

      const { error } = await supabase
        .from('meal_plans')
        .insert(mealPlans);

      if (error) throw error;

      toast({
        title: "Recette planifiée",
        description: `La recette a été planifiée pour ${children.length} enfant(s) le ${format(date, 'dd MMMM yyyy', { locale: fr })}`,
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

  return { planningRecipe, planRecipe };
};