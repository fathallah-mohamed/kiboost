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
              id: child.id,
              name: child.name,
              birth_date: child.birth_date,
              allergies: child.allergies || [],
              preferences: child.preferences || [],
              profile_id: child.profile_id
            },
            filters
          }
        }
      );

      if (generateError) {
        console.error("Error from generate-recipe function:", generateError);
        throw new Error(generateError.message || "Erreur lors de la génération des recettes");
      }

      console.log("Response from generate-recipe:", response);

      if (!response?.recipes || !Array.isArray(response.recipes)) {
        throw new Error("Format de réponse invalide");
      }

      const savedRecipes: Recipe[] = [];

      for (const recipe of response.recipes) {
        try {
          console.log("Processing recipe:", recipe);

          // Ensure ingredients is a proper JSON object
          const ingredients = typeof recipe.ingredients === 'string' 
            ? JSON.parse(recipe.ingredients) 
            : recipe.ingredients;

          // Ensure nutritional_info is a proper JSON object
          const nutritionalInfo = typeof recipe.nutritional_info === 'string'
            ? JSON.parse(recipe.nutritional_info)
            : recipe.nutritional_info;

          // Ensure health_benefits is a proper JSON array
          const healthBenefits = typeof recipe.health_benefits === 'string'
            ? JSON.parse(recipe.health_benefits)
            : recipe.health_benefits || [];

          // Ensure cooking_steps is a proper JSON array
          const cookingSteps = typeof recipe.cooking_steps === 'string'
            ? JSON.parse(recipe.cooking_steps)
            : recipe.cooking_steps || [];

          const recipeData = {
            profile_id: child.profile_id,
            child_id: child.id,
            name: String(recipe.name),
            ingredients: ingredients,
            instructions: Array.isArray(recipe.instructions) 
              ? recipe.instructions
              : [String(recipe.instructions)],
            nutritional_info: nutritionalInfo,
            meal_type: recipe.meal_type || 'dinner',
            preparation_time: Number(recipe.preparation_time) || 30,
            max_prep_time: Number(filters.maxPrepTime) || 30,
            difficulty: recipe.difficulty || 'medium',
            servings: Number(recipe.servings) || 4,
            auto_generated: true,
            source: 'ia',
            health_benefits: healthBenefits,
            cooking_steps: cookingSteps,
            image_url: String(recipe.image_url || 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9'),
            min_age: Number(recipe.min_age) || 0,
            max_age: Number(recipe.max_age) || 18,
            dietary_preferences: Array.isArray(recipe.dietary_preferences) 
              ? recipe.dietary_preferences
              : [],
            allergens: Array.isArray(recipe.allergens) 
              ? recipe.allergens
              : [],
            cost_estimate: Number(recipe.cost_estimate) || 0,
            seasonal_months: Array.isArray(recipe.seasonal_months) 
              ? recipe.seasonal_months
              : [1,2,3,4,5,6,7,8,9,10,11,12],
            is_generated: true
          };

          console.log("Saving recipe with data:", recipeData);

          const { data: savedRecipe, error: saveError } = await supabase
            .from('recipes')
            .insert(recipeData)
            .select()
            .single();

          if (saveError) {
            console.error("Error saving recipe:", saveError);
            throw saveError;
          }

          if (savedRecipe) {
            savedRecipes.push(savedRecipe as Recipe);
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