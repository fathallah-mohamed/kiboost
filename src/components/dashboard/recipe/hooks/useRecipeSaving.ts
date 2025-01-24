import { useState } from 'react';
import { Recipe } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useRecipeSaving = () => {
  const [saving, setSaving] = useState(false);

  const saveRecipe = async (recipe: Recipe) => {
    try {
      setSaving(true);
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id;

      if (!userId) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('recipes')
        .insert({
          ...recipe,
          profile_id: userId,
        });

      if (error) throw error;

      toast("Recette sauvegardée avec succès");
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast("Erreur lors de la sauvegarde de la recette");
      throw error;
    } finally {
      setSaving(false);
    }
  };

  return {
    saveRecipe,
    saving,
  };
};