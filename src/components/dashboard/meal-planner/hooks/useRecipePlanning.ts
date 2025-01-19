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
    console.log('Planning recipe:', recipe);
    console.log('Recipe ID:', recipe?.id);
    console.log('Children:', children);
    console.log('Date:', date);
    console.log('User ID:', userId);

    if (!recipe?.id) {
      console.error('Recipe ID is missing:', recipe);
      toast.error("Erreur lors de la planification", {
        description: "ID de recette manquant. Impossible de planifier la recette.",
      });
      return;
    }

    if (children.length === 0) {
      toast.error("Erreur lors de la planification", {
        description: "Veuillez sélectionner au moins un enfant.",
      });
      return;
    }

    setSaving(true);
    const formattedDate = format(date, 'yyyy-MM-dd');

    try {
      for (const child of children) {
        try {
          console.log('Inserting meal plan for child:', child.id);
          
          const mealPlanData = {
            profile_id: userId,
            recipe_id: recipe.id,
            date: formattedDate,
            child_id: child.id,
            meal_time: recipe.meal_type || 'dinner',
            updated_at: new Date().toISOString()
          };

          console.log('Meal plan data:', mealPlanData);

          const { error } = await supabase
            .from('meal_plans')
            .upsert(mealPlanData, {
              onConflict: 'profile_id,date,child_id,meal_time'
            });

          if (error) {
            console.error('Error managing meal plan:', error);
            throw error;
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