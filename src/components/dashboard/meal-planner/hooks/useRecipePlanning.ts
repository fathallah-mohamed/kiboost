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
      
      // Pour chaque enfant, on va d'abord vérifier si un repas existe déjà
      for (const child of children) {
        // Vérifier si un repas existe déjà pour cet enfant à cette date et ce moment de la journée
        const { data: existingMeal } = await supabase
          .from('meal_plans')
          .select()
          .match({
            profile_id: userId,
            date: formattedDate,
            meal_time: recipe.meal_type,
            child_id: child.id
          })
          .single();

        if (existingMeal) {
          // Si un repas existe, on le met à jour
          const { error: updateError } = await supabase
            .from('meal_plans')
            .update({
              recipe_id: recipe.id,
              updated_at: new Date().toISOString()
            })
            .match({
              profile_id: userId,
              date: formattedDate,
              meal_time: recipe.meal_type,
              child_id: child.id
            });

          if (updateError) throw updateError;
        } else {
          // Si aucun repas n'existe, on en crée un nouveau
          const { error: insertError } = await supabase
            .from('meal_plans')
            .insert({
              profile_id: userId,
              recipe_id: recipe.id,
              date: formattedDate,
              child_id: child.id,
              meal_time: recipe.meal_type || 'dinner'
            });

          if (insertError) throw insertError;
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