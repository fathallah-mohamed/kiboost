import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Recipe } from "../../types";
import { ChildProfile } from "../../types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

export const useRecipePlanning = () => {
  const [saving, setSaving] = useState(false);

  const planRecipe = async (
    recipe: Recipe,
    children: ChildProfile[],
    date: Date,
    userId: string
  ) => {
    setSaving(true);
    const formattedDate = format(date, 'yyyy-MM-dd');

    try {
      // Pour chaque enfant, on va gérer le repas
      for (const child of children) {
        // Vérifier si un repas existe déjà pour cet enfant à cette date et ce moment de la journée
        const { data: existingMeal, error: queryError } = await supabase
          .from('meal_plans')
          .select()
          .eq('profile_id', userId)
          .eq('date', formattedDate)
          .eq('meal_time', recipe.meal_type)
          .eq('child_id', child.id)
          .maybeSingle();

        if (queryError) {
          console.error('Error checking existing meal:', queryError);
          throw queryError;
        }

        try {
          if (existingMeal) {
            // Si un repas existe et qu'il est différent, on le met à jour
            if (existingMeal.recipe_id !== recipe.id) {
              const { error: updateError } = await supabase
                .from('meal_plans')
                .update({
                  recipe_id: recipe.id,
                  updated_at: new Date().toISOString()
                })
                .match({
                  id: existingMeal.id
                });

              if (updateError) throw updateError;
            }
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
        } catch (error: any) {
          console.error('Error managing meal plan:', error);
          throw error;
        }
      }

      // Afficher une notification de succès avec Sonner
      toast.success("Recette planifiée !", {
        description: `${recipe.name} a été planifiée pour ${children.length} enfant(s) le ${format(date, 'dd MMMM yyyy', { locale: fr })}`,
        duration: 4000,
        action: {
          label: "Voir le planning",
          onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' })
        },
      });

    } catch (error: any) {
      console.error('Error planning recipe:', error);
      toast.error("Erreur lors de la planification", {
        description: "Une erreur est survenue lors de la planification de la recette.",
      });
    } finally {
      setSaving(false);
    }
  };

  return {
    planRecipe,
    saving
  };
};