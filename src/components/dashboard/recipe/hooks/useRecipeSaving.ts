import { Recipe } from "../../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSession } from "@supabase/auth-helpers-react";

export const useRecipeSaving = () => {
  const session = useSession();

  const saveRecipe = async (recipe: Recipe) => {
    if (!session?.user?.id) {
      toast.error("Vous devez être connecté pour sauvegarder une recette");
      return;
    }

    try {
      const recipeToSave = {
        ...recipe,
        profile_id: session.user.id,  // Add this line to set the profile_id
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