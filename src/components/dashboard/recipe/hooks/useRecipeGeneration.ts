import { useState } from "react";
import { Recipe, RecipeFilters, ChildProfile } from "../../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { transformToRecipeData } from "../utils/recipeTransformers";

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

      // First check for existing recipes
      const { data: existingRecipes, error: fetchError } = await supabase
        .from('recipes')
        .select('*')
        .eq('profile_id', child.profile_id)
        .eq('child_id', child.id)
        .eq('auto_generated', true)
        .eq('meal_type', filters.mealType !== 'all' ? filters.mealType : 'dinner')
        .lte('max_prep_time', filters.maxPrepTime || 30)
        .eq('difficulty', filters.difficulty !== 'all' ? filters.difficulty : 'medium');

      if (fetchError) throw fetchError;

      if (existingRecipes && existingRecipes.length > 0) {
        console.log("Using existing recipes:", existingRecipes);
        return existingRecipes;
      }

      // Generate new recipes if none exist
      const { data: response, error: generateError } = await supabase.functions.invoke(
        'generate-recipe',
        {
          body: { 
            child: {
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

      // Save each recipe
      for (const recipe of response.recipes) {
        try {
          const recipeData = {
            profile_id: child.profile_id,
            child_id: child.id,
            name: recipe.name,
            ingredients: JSON.stringify(recipe.ingredients),
            instructions: recipe.instructions.join('\n'),
            nutritional_info: JSON.stringify(recipe.nutritional_info),
            meal_type: filters.mealType !== 'all' ? filters.mealType : 'dinner',
            preparation_time: recipe.preparation_time || 30,
            max_prep_time: filters.maxPrepTime || 30,
            difficulty: filters.difficulty !== 'all' ? filters.difficulty : 'medium',
            servings: recipe.servings || 4,
            auto_generated: true,
            source: 'ia',
            health_benefits: recipe.health_benefits ? JSON.stringify(recipe.health_benefits) : null,
            cooking_steps: recipe.cooking_steps ? JSON.stringify(recipe.cooking_steps) : null,
            image_url: recipe.image_url || 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9'
          };

          const { data: savedRecipe, error: saveError } = await supabase
            .from('recipes')
            .insert(recipeData)
            .select()
            .single();

          if (saveError) throw saveError;
          if (savedRecipe) {
            savedRecipes.push({
              ...savedRecipe,
              ingredients: JSON.parse(savedRecipe.ingredients),
              nutritional_info: JSON.parse(savedRecipe.nutritional_info),
              instructions: savedRecipe.instructions.split('\n'),
              health_benefits: savedRecipe.health_benefits ? JSON.parse(savedRecipe.health_benefits) : undefined,
              cooking_steps: savedRecipe.cooking_steps ? JSON.parse(savedRecipe.cooking_steps) : []
            });
          }
        } catch (error) {
          console.error('Error processing recipe:', recipe.name, error);
          continue;
        }
      }

      if (savedRecipes.length === 0) {
        throw new Error("Aucune recette n'a pu être sauvegardée");
      }

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