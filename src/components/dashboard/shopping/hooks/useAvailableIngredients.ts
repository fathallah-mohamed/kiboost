import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AvailableIngredient } from '../types';

export const useAvailableIngredients = (userId: string) => {
  const [availableIngredients, setAvailableIngredients] = useState<AvailableIngredient[]>([]);

  const fetchAvailableIngredients = async () => {
    const { data, error } = await supabase
      .from('available_ingredients')
      .select('*')
      .eq('profile_id', userId);

    if (error) {
      console.error('Error fetching available ingredients:', error);
      return;
    }

    setAvailableIngredients(data || []);
  };

  const addIngredient = async (newIngredient: AvailableIngredient) => {
    if (!newIngredient.ingredient_name || !newIngredient.quantity) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    const { error } = await supabase
      .from('available_ingredients')
      .insert({
        profile_id: userId,
        ...newIngredient
      });

    if (error) {
      console.error('Error adding ingredient:', error);
      toast.error("Erreur lors de l'ajout de l'ingrédient");
      return;
    }

    toast.success("Ingrédient ajouté avec succès");
    fetchAvailableIngredients();
  };

  const removeIngredient = async (id: string) => {
    const { error } = await supabase
      .from('available_ingredients')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error removing ingredient:', error);
      toast.error("Erreur lors de la suppression de l'ingrédient");
      return;
    }

    toast.success("Ingrédient supprimé avec succès");
    fetchAvailableIngredients();
  };

  useEffect(() => {
    fetchAvailableIngredients();
  }, [userId]);

  return {
    availableIngredients,
    addIngredient,
    removeIngredient
  };
};