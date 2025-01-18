import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Recipe, ChildProfile } from '../../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

export const useRecipeSaving = () => {
  const [saving, setSaving] = useState(false);

  const saveRecipe = async (recipe: Recipe, selectedChildren: ChildProfile[]) => {
    if (selectedChildren.length === 0) {
      toast.error("Veuillez sélectionner au moins un enfant");
      return null;
    }

    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Non authentifié");

      const today = new Date();
      const formattedDate = format(today, 'yyyy-MM-dd');

      // Créer les entrées dans meal_plans pour chaque enfant
      for (const child of selectedChildren) {
        const { error: planError } = await supabase
          .from('meal_plans')
          .insert({
            profile_id: session.user.id,
            recipe_id: recipe.id,
            child_id: child.id,
            date: formattedDate,
            meal_time: recipe.meal_type || 'dinner'
          });

        if (planError) throw planError;
      }

      toast.success("Recette planifiée !", {
        description: `${recipe.name} a été planifiée pour ${selectedChildren.length} enfant(s)`,
      });

      return recipe;
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast.error("Erreur lors de la planification", {
        description: "Une erreur est survenue lors de la planification de la recette.",
      });
      return null;
    } finally {
      setSaving(false);
    }
  };

  return { saveRecipe, saving };
};