import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Recipe, ChildProfile } from '../../types';

export const useRecipeSaving = () => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const saveRecipe = async (recipe: Recipe, selectedChildren: ChildProfile[]) => {
    try {
      setSaving(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Non authentifié");

      // Format the recipe data according to the database schema
      const recipeData = {
        profile_id: session.user.id,
        name: recipe.name,
        ingredients: JSON.stringify(recipe.ingredients),
        instructions: recipe.instructions.join('\n'),
        nutritional_info: JSON.stringify(recipe.nutritional_info),
        meal_type: recipe.meal_type || 'dinner', // Ensure meal_type is never null
        preparation_time: recipe.preparation_time || 30, // Use default if not provided
        difficulty: recipe.difficulty || 'medium', // Use default if not provided
        servings: recipe.servings || 4, // Use default if not provided
      };

      const { data: savedRecipe, error: recipeError } = await supabase
        .from('recipes')
        .insert([recipeData])
        .select()
        .single();

      if (recipeError) throw recipeError;

      // Save to meal plan for each selected child
      const mealPlans = selectedChildren.map(child => ({
        profile_id: session.user.id,
        recipe_id: savedRecipe.id,
        child_id: child.id,
        date: new Date().toISOString().split('T')[0],
        meal_time: recipe.meal_type || 'dinner', // Ensure meal_time is never null
      }));

      const { error: planError } = await supabase
        .from('meal_plans')
        .insert(mealPlans);

      if (planError) throw planError;

      toast({
        title: "Recette sauvegardée",
        description: `La recette a été ajoutée au planificateur pour ${selectedChildren.length} enfant(s)`,
      });

      return savedRecipe;
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de sauvegarder la recette.",
      });
      return null;
    } finally {
      setSaving(false);
    }
  };

  return { saveRecipe, saving };
};