import { useState } from 'react';
import { Recipe, ChildProfile } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RecipeResponse {
  name: string;
  ingredients: Array<{
    item: string;
    quantity: string;
    unit: string;
  }>;
  instructions: string[];
  nutritional_info: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  meal_type: string;
  preparation_time: number;
  difficulty: string;
  servings: number;
  health_benefits?: Array<{
    icon: string;
    category: string;
    description: string;
  }>;
}

const mapHealthBenefitCategory = (category: string): string => {
  const categoryMap: { [key: string]: string } = {
    strength: 'physical',
    muscle: 'physical',
    brain: 'cognitive',
    heart: 'physical',
    cardiovascular: 'physical',
    cardio: 'physical',
    blood: 'physical',
    circulation: 'physical',
    // Add more mappings as needed
  };
  
  const mappedCategory = categoryMap[category.toLowerCase()] || category;
  
  // Ensure the category is one of the valid ones, default to 'physical' if not
  const validCategories = [
    'cognitive', 'energy', 'satiety', 'digestive', 'immunity',
    'growth', 'mental', 'organs', 'beauty', 'physical',
    'prevention', 'global'
  ];
  
  return validCategories.includes(mappedCategory) ? mappedCategory : 'physical';
};

export const useRecipeGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateRecipes = async (child: ChildProfile) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Generating recipes for child:', child);
      
      const { data: generatedRecipes, error: functionError } = await supabase.functions.invoke('generate-recipe', {
        body: { childProfiles: [child] }
      });

      if (functionError) {
        console.error('Error from Edge Function:', functionError);
        throw new Error(functionError.message);
      }

      console.log('Generated recipes:', generatedRecipes);
      
      if (!generatedRecipes || !Array.isArray(generatedRecipes)) {
        throw new Error('Format de réponse invalide');
      }

      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id;

      if (!userId) {
        throw new Error('Utilisateur non connecté');
      }

      const savedRecipes = await Promise.all(
        generatedRecipes.map(async (recipe: RecipeResponse) => {
          // Map health benefits categories to valid ones
          const mappedHealthBenefits = recipe.health_benefits?.map(benefit => ({
            ...benefit,
            category: mapHealthBenefitCategory(benefit.category)
          })) || [];

          const recipeData = {
            profile_id: userId,
            name: recipe.name,
            ingredients: recipe.ingredients,
            instructions: recipe.instructions.map((instruction, index) => 
              `${index + 1}. ${instruction}`
            ).join('\n'),
            nutritional_info: recipe.nutritional_info,
            meal_type: recipe.meal_type,
            preparation_time: recipe.preparation_time,
            difficulty: recipe.difficulty,
            servings: recipe.servings,
            is_generated: true,
            health_benefits: mappedHealthBenefits,
            cooking_steps: [],
            min_age: 0,
            max_age: 18,
            dietary_preferences: [],
            allergens: [],
            cost_estimate: 0,
            seasonal_months: [1,2,3,4,5,6,7,8,9,10,11,12]
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

          return {
            ...savedRecipe,
            instructions: savedRecipe.instructions.split('\n').map(instruction => 
              instruction.replace(/^\d+\.\s/, '')
            ),
            ingredients: recipe.ingredients,
            nutritional_info: recipe.nutritional_info,
            health_benefits: mappedHealthBenefits,
            cooking_steps: []
          } as Recipe;
        })
      );

      console.log('Saved recipes:', savedRecipes);
      return savedRecipes;

    } catch (err) {
      console.error('Error generating recipes:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
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