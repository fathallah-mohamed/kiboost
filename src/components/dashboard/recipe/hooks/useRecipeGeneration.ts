import { useState } from "react";
import { Recipe, RecipeFilters, ChildProfile } from "../../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useRecipeGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateRecipes = async (child: ChildProfile, filters: RecipeFilters) => {
    if (!child.name || !child.birth_date) {
      throw new Error("Les informations de l'enfant sont incomplètes");
    }

    try {
      setLoading(true);
      setError(null);
      console.log("Generating recipes for child:", child);
      console.log("Using filters:", filters);

      const { data: response, error: generateError } = await supabase.functions.invoke(
        'generate-recipe',
        {
          body: { 
            child: {
              ...child,
              id: child.id,
              name: child.name,
              birth_date: child.birth_date,
              allergies: child.allergies || [],
              preferences: child.preferences || []
            },
            filters
          }
        }
      );

      if (generateError) throw generateError;
      console.log("Generated recipe response:", response);

      if (!response.recipes || !Array.isArray(response.recipes)) {
        throw new Error("Format de réponse invalide");
      }

      const savedRecipes: Recipe[] = [];

      // Supprimer d'abord toutes les recettes générées précédemment
      const { error: deleteError } = await supabase
        .from('recipes')
        .delete()
        .eq('profile_id', child.profile_id)
        .eq('is_generated', true);

      if (deleteError) {
        console.error("Error deleting old recipes:", deleteError);
        throw deleteError;
      }

      // Sauvegarder les nouvelles recettes
      for (const recipe of response.recipes) {
        try {
          const recipeToInsert = {
            profile_id: child.profile_id,
            name: recipe.name,
            ingredients: recipe.ingredients,
            instructions: recipe.instructions,
            nutritional_info: recipe.nutritional_info,
            meal_type: recipe.meal_type,
            preparation_time: recipe.preparation_time,
            difficulty: recipe.difficulty,
            servings: recipe.servings,
            is_generated: true,
            health_benefits: recipe.health_benefits,
            min_age: recipe.min_age || 0,
            max_age: recipe.max_age || 18,
            dietary_preferences: recipe.dietary_preferences || [],
            allergens: recipe.allergens || [],
            cost_estimate: recipe.cost_estimate || 0,
            seasonal_months: recipe.seasonal_months || [1,2,3,4,5,6,7,8,9,10,11,12],
            cooking_steps: recipe.cooking_steps || []
          };

          const { data: savedRecipe, error: saveError } = await supabase
            .from('recipes')
            .insert(recipeToInsert)
            .select('*')
            .single();

          if (saveError) throw saveError;

          console.log('Successfully saved recipe:', savedRecipe);
          savedRecipes.push(savedRecipe as Recipe);
          
        } catch (error) {
          console.error('Error processing recipe:', recipe.name, error);
          continue;
        }
      }

      if (savedRecipes.length === 0) {
        throw new Error("Aucune recette n'a pu être sauvegardée");
      }

      toast.success(`${savedRecipes.length} nouvelles recettes ont été générées !`);
      return savedRecipes;

    } catch (err) {
      console.error("Error in recipe generation process:", err);
      const errorMessage = err instanceof Error ? err.message : "Une erreur est survenue";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateRecipes,
    loading,
    error
  };
};