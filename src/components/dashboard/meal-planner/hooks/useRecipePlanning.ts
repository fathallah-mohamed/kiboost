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
      
      // Créer un tableau de promesses pour la suppression des repas existants
      const deletePromises = children.map(child => 
        supabase
          .from('meal_plans')
          .delete()
          .match({
            profile_id: userId,
            date: formattedDate,
            meal_time: recipe.meal_type,
            child_id: child.id
          })
      );

      // Attendre que toutes les suppressions soient terminées
      await Promise.all(deletePromises);

      // Créer les nouveaux meal plans
      const mealPlans = children.map(child => ({
        profile_id: userId,
        recipe_id: recipe.id,
        date: formattedDate,
        child_id: child.id,
        meal_time: recipe.meal_type || 'dinner'
      }));

      // Insérer les nouveaux meal plans un par un pour éviter les conflits
      for (const mealPlan of mealPlans) {
        const { error } = await supabase
          .from('meal_plans')
          .insert(mealPlan);

        if (error) {
          console.error('Error inserting meal plan:', error);
          throw error;
        }
      }

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