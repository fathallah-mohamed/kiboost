import { useState } from 'react';
import { Recipe, ChildProfile } from '../../types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useRecipeGeneration = () => {
  const [loading, setLoading] = useState(false);

  const generateRecipes = async (child: ChildProfile): Promise<Recipe[] | null> => {
    try {
      setLoading(true);
      
      const { data: generatedRecipes, error: functionError } = await supabase.functions.invoke('generate-recipe', {
        body: { childProfiles: [child] }
      });

      if (functionError) {
        console.error('Error from Edge Function:', functionError);
        throw new Error(functionError.message);
      }
      
      if (!generatedRecipes || !Array.isArray(generatedRecipes)) {
        throw new Error('Format de réponse invalide');
      }

      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id;

      if (!userId) {
        throw new Error('Utilisateur non connecté');
      }

      const recipes = await Promise.all(
        generatedRecipes.map(async (recipe: any) => {
          const recipeData = {
            profile_id: userId,
            name: recipe.name,
            ingredients: recipe.ingredients,
            instructions: recipe.instructions,
            nutritional_info: recipe.nutritional_info,
            meal_type: recipe.meal_type,
            preparation_time: recipe.preparation_time,
            difficulty: recipe.difficulty,
            servings: recipe.servings,
            is_generated: true,
            health_benefits: recipe.health_benefits || [],
            cooking_steps: recipe.cooking_steps || [],
            min_age: recipe.min_age || 0,
            max_age: recipe.max_age || 18,
            dietary_preferences: recipe.dietary_preferences || [],
            allergens: recipe.allergens || [],
            cost_estimate: recipe.cost_estimate || 0,
            seasonal_months: recipe.seasonal_months || [1,2,3,4,5,6,7,8,9,10,11,12]
          };

          const { data: savedRecipe, error: saveError } = await supabase
            .from('recipes')
            .insert(recipeData)
            .select('*')
            .single();

          if (saveError) {
            console.error('Error saving recipe:', saveError);
            throw saveError;
          }

          return savedRecipe as Recipe;
        })
      );

      toast.success('Recettes générées avec succès !');
      return recipes;

    } catch (err) {
      console.error('Error generating recipes:', err);
      toast.error("Une erreur est survenue lors de la génération des recettes");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateRecipes,
    loading
  };
};