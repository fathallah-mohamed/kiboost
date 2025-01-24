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
      // Vérifier d'abord que l'utilisateur a accès à la table children_profiles
      const { data: childrenCheck, error: childrenError } = await supabase
        .from('children_profiles')
        .select('id')
        .eq('profile_id', userId)
        .in('id', children.map(child => child.id));

      if (childrenError) {
        console.error('Error checking children access:', childrenError);
        throw new Error('Erreur de vérification des profils enfants');
      }

      if (!childrenCheck || childrenCheck.length !== children.length) {
        throw new Error('Accès non autorisé à certains profils enfants');
      }

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
        description: error.message || "Une erreur est survenue lors de la planification de la recette.",
      });
    } finally {
      setSaving(false);
    }
  };

  const removePlannedRecipe = async (date: string, childId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('meal_plans')
        .delete()
        .match({
          profile_id: userId,
          date: date,
          child_id: childId
        });

      if (error) {
        throw error;
      }

      toast.success("Recette supprimée", {
        description: "La recette a été retirée du planificateur"
      });

    } catch (error: any) {
      console.error('Error removing planned recipe:', error);
      toast.error("Erreur lors de la suppression", {
        description: error.message || "Une erreur est survenue lors de la suppression de la recette"
      });
    }
  };

  return {
    planRecipe,
    removePlannedRecipe,
    saving
  };
};