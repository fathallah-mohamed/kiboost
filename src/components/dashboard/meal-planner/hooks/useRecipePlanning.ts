import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Recipe, ChildProfile } from "../../types";
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
      for (const child of children) {
        try {
          // First check if a meal plan already exists for this combination
          const { data: existingMeal, error: checkError } = await supabase
            .from('meal_plans')
            .select('id')
            .eq('profile_id', userId)
            .eq('date', formattedDate)
            .eq('child_id', child.id)
            .eq('meal_time', recipe.meal_type)
            .maybeSingle();

          if (checkError) {
            console.error('Error checking existing meal:', checkError);
            throw checkError;
          }

          if (existingMeal) {
            // Update existing meal plan
            const { error: updateError } = await supabase
              .from('meal_plans')
              .update({
                recipe_id: recipe.id,
                updated_at: new Date().toISOString()
              })
              .eq('id', existingMeal.id);

            if (updateError) throw updateError;
          } else {
            // Create new meal plan
            const { error: insertError } = await supabase
              .from('meal_plans')
              .upsert({
                profile_id: userId,
                recipe_id: recipe.id,
                date: formattedDate,
                child_id: child.id,
                meal_time: recipe.meal_type || 'dinner'
              });

            if (insertError) {
              // If we get a unique constraint violation, try updating instead
              if (insertError.code === '23505') {
                const { error: retryError } = await supabase
                  .from('meal_plans')
                  .update({
                    recipe_id: recipe.id,
                    updated_at: new Date().toISOString()
                  })
                  .eq('profile_id', userId)
                  .eq('date', formattedDate)
                  .eq('child_id', child.id)
                  .eq('meal_time', recipe.meal_type);

                if (retryError) throw retryError;
              } else {
                throw insertError;
              }
            }
          }
        } catch (error: any) {
          console.error('Error managing meal plan:', error);
          throw error;
        }
      }

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