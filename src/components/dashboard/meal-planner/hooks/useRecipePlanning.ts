import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Recipe, ChildProfile } from "../../types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

interface MealPlanOperation {
  userId: string;
  child: ChildProfile;
  recipe: Recipe;
  formattedDate: string;
}

const checkExistingMeal = async ({ userId, child, recipe, formattedDate }: MealPlanOperation) => {
  const { data: existingMeal, error } = await supabase
    .from('meal_plans')
    .select()
    .eq('profile_id', userId)
    .eq('date', formattedDate)
    .eq('child_id', child.id)
    .eq('meal_time', recipe.meal_type)
    .maybeSingle();

  if (error) {
    console.error('Error checking existing meal:', error);
    throw error;
  }

  return existingMeal;
};

const updateMealPlan = async ({ userId, child, recipe, formattedDate }: MealPlanOperation) => {
  const { error } = await supabase
    .from('meal_plans')
    .update({
      recipe_id: recipe.id,
      updated_at: new Date().toISOString()
    })
    .eq('profile_id', userId)
    .eq('date', formattedDate)
    .eq('child_id', child.id)
    .eq('meal_time', recipe.meal_type);

  if (error) throw error;
};

const createMealPlan = async ({ userId, child, recipe, formattedDate }: MealPlanOperation) => {
  const { error } = await supabase
    .from('meal_plans')
    .insert({
      profile_id: userId,
      recipe_id: recipe.id,
      date: formattedDate,
      child_id: child.id,
      meal_time: recipe.meal_type || 'dinner'
    });

  if (error) throw error;
};

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
          const existingMeal = await checkExistingMeal({ userId, child, recipe, formattedDate });
          
          if (existingMeal) {
            await updateMealPlan({ userId, child, recipe, formattedDate });
          } else {
            await createMealPlan({ userId, child, recipe, formattedDate });
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