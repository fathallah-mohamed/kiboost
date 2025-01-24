import { useState } from 'react';
import { Recipe, ChildProfile } from '../../types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useRecipeSaving = () => {
  const [saving, setSaving] = useState(false);

  const saveRecipe = async (recipe: Recipe, selectedChildren: ChildProfile[]) => {
    try {
      setSaving(true);
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('meal_plans')
        .insert({
          profile_id: session.session.user.id,
          recipe_id: recipe.id,
          date: new Date().toISOString().split('T')[0],
          child_id: selectedChildren[0]?.id
        });

      if (error) throw error;

      toast({
        title: "Recette planifiée",
        description: "La recette a été ajoutée à votre planning.",
      });
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de sauvegarder la recette.",
      });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  return { saveRecipe, saving };
};