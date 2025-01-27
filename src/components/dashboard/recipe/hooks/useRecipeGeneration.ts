import { useState } from "react";
import { Recipe, RecipeFilters, ChildProfile, MealType, Difficulty } from "../../types";
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

      // Récupérer d'abord les recettes existantes
      const { data: existingRecipes, error: fetchError } = await supabase
        .from('recipes')
        .select('*')
        .eq('profile_id', child.profile_id)
        .eq('is_generated', true);

      if (fetchError) throw fetchError;

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
            filters,
            existingRecipes: existingRecipes || []
          }
        }
      );

      if (generateError) throw generateError;
      console.log("Generated recipe response:", response);

      if (!response.recipes || !Array.isArray(response.recipes)) {
        throw new Error("Format de réponse invalide");
      }

      // Delete all previously generated recipes for this user
      const { error: deleteError } = await supabase
        .from('recipes')
        .delete()
        .eq('profile_id', child.profile_id)
        .eq('is_generated', true);

      if (deleteError) {
        console.error("Error deleting old recipes:", deleteError);
        throw deleteError;
      }

      const savedRecipes: Recipe[] = [];

      // Sauvegarder les nouvelles recettes
      for (const recipe of response.recipes) {
        try {
          // Ensure ingredients is properly formatted
          const ingredients = Array.isArray(recipe.ingredients) 
            ? recipe.ingredients.map((ing: any) => ({
                item: String(ing.item || ''),
                quantity: String(ing.quantity || ''),
                unit: String(ing.unit || '')
              }))
            : [];

          // Validate meal_type
          const validMealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];
          const mealType: MealType = validMealTypes.includes(recipe.meal_type as MealType) 
            ? recipe.meal_type as MealType 
            : 'dinner';

          // Validate difficulty
          const validDifficulties: Difficulty[] = ['easy', 'medium', 'hard'];
          const difficulty: Difficulty = validDifficulties.includes(recipe.difficulty as Difficulty)
            ? recipe.difficulty as Difficulty
            : 'medium';

          const recipeToInsert = {
            profile_id: child.profile_id,
            name: recipe.name,
            ingredients: JSON.stringify(ingredients),
            instructions: Array.isArray(recipe.instructions) 
              ? recipe.instructions.map(String)
              : [String(recipe.instructions)],
            nutritional_info: JSON.stringify(recipe.nutritional_info),
            meal_type: mealType,
            preparation_time: Number(recipe.preparation_time) || 30,
            difficulty: difficulty,
            servings: Number(recipe.servings) || 4,
            is_generated: true,
            image_url: recipe.image_url || 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
            health_benefits: JSON.stringify(recipe.health_benefits || []),
            min_age: Number(recipe.min_age) || 0,
            max_age: Number(recipe.max_age) || 18,
            dietary_preferences: recipe.dietary_preferences || [],
            allergens: recipe.allergens || [],
            cost_estimate: Number(recipe.cost_estimate) || 0,
            seasonal_months: recipe.seasonal_months || [1,2,3,4,5,6,7,8,9,10,11,12],
            cooking_steps: JSON.stringify(recipe.cooking_steps || [])
          };

          const { data: savedRecipe, error: saveError } = await supabase
            .from('recipes')
            .insert(recipeToInsert)
            .select('*')
            .single();

          if (saveError) throw saveError;

          // Transform the saved recipe to match the Recipe type
          const transformedRecipe: Recipe = {
            ...savedRecipe,
            ingredients: JSON.parse(savedRecipe.ingredients),
            instructions: Array.isArray(savedRecipe.instructions) 
              ? savedRecipe.instructions
              : [String(savedRecipe.instructions)],
            nutritional_info: typeof savedRecipe.nutritional_info === 'string' 
              ? JSON.parse(savedRecipe.nutritional_info)
              : savedRecipe.nutritional_info,
            health_benefits: typeof savedRecipe.health_benefits === 'string'
              ? JSON.parse(savedRecipe.health_benefits)
              : savedRecipe.health_benefits || [],
            cooking_steps: typeof savedRecipe.cooking_steps === 'string'
              ? JSON.parse(savedRecipe.cooking_steps)
              : savedRecipe.cooking_steps || [],
            meal_type: savedRecipe.meal_type as MealType,
            difficulty: savedRecipe.difficulty as Difficulty,
          };

          console.log('Successfully saved recipe:', transformedRecipe);
          savedRecipes.push(transformedRecipe);
          
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