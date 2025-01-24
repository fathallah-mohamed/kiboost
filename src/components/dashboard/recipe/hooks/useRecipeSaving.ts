import { Recipe } from "../../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useRecipeSaving = () => {
  const saveRecipe = async (recipe: Recipe) => {
    try {
      const recipeToSave = {
        ...recipe,
        instructions: Array.isArray(recipe.instructions) 
          ? recipe.instructions.join('\n') 
          : recipe.instructions,
        ingredients: JSON.stringify(recipe.ingredients),
        nutritional_info: JSON.stringify(recipe.nutritional_info),
        health_benefits: JSON.stringify(recipe.health_benefits || []),
        cooking_steps: JSON.stringify(recipe.cooking_steps || [])
      };

      const { error } = await supabase
        .from('recipes')
        .insert(recipeToSave);

      if (error) throw error;
      
      toast.success("Recette sauvegardée avec succès !");
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast.error("Une erreur est survenue lors de la sauvegarde de la recette");
      throw error;
    }
  };

  return { saveRecipe };
};