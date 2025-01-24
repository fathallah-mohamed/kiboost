import { useState } from 'react';
import { Recipe, ChildProfile, HealthBenefitCategory } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
        generatedRecipes.map(async (recipe) => {
          const transformedRecipe = {
            ...recipe,
            profile_id: userId,
            is_generated: true,
            ingredients: Array.isArray(recipe.ingredients) 
              ? recipe.ingredients.map((ing: any) => ({
                  item: ing.item || ing.name || '',
                  quantity: ing.quantity?.toString() || '0',
                  unit: ing.unit || ''
                }))
              : [],
            instructions: Array.isArray(recipe.instructions) 
              ? recipe.instructions 
              : [recipe.instructions].filter(Boolean),
            nutritional_info: {
              calories: Number(recipe.nutritional_info?.calories) || 0,
              protein: Number(recipe.nutritional_info?.protein) || 0,
              carbs: Number(recipe.nutritional_info?.carbs) || 0,
              fat: Number(recipe.nutritional_info?.fat) || 0
            },
            health_benefits: Array.isArray(recipe.health_benefits)
              ? recipe.health_benefits.map((benefit: any) => ({
                  icon: benefit.icon || 'sparkles',
                  category: (benefit.category || 'global') as HealthBenefitCategory,
                  description: benefit.description || ''
                }))
              : [],
            cooking_steps: Array.isArray(recipe.cooking_steps)
              ? recipe.cooking_steps.map((step: any, index: number) => ({
                  step: Number(step.step) || index + 1,
                  description: step.description || '',
                  duration: step.duration ? Number(step.duration) : undefined,
                  tips: step.tips || undefined
                }))
              : []
          };

          const { data: savedRecipe, error: saveError } = await supabase
            .from('recipes')
            .insert(transformedRecipe)
            .select('*')
            .single();

          if (saveError) {
            console.error('Error saving recipe:', saveError);
            throw saveError;
          }

          return {
            ...savedRecipe,
            ingredients: Array.isArray(savedRecipe.ingredients) 
              ? savedRecipe.ingredients.map((ing: any) => ({
                  item: ing.item || ing.name || '',
                  quantity: ing.quantity?.toString() || '0',
                  unit: ing.unit || ''
                }))
              : [],
            instructions: Array.isArray(savedRecipe.instructions) 
              ? savedRecipe.instructions 
              : [savedRecipe.instructions].filter(Boolean),
            nutritional_info: {
              calories: Number(savedRecipe.nutritional_info?.calories) || 0,
              protein: Number(savedRecipe.nutritional_info?.protein) || 0,
              carbs: Number(savedRecipe.nutritional_info?.carbs) || 0,
              fat: Number(savedRecipe.nutritional_info?.fat) || 0
            },
            health_benefits: Array.isArray(savedRecipe.health_benefits)
              ? savedRecipe.health_benefits.map((benefit: any) => ({
                  icon: benefit.icon || 'sparkles',
                  category: (benefit.category || 'global') as HealthBenefitCategory,
                  description: benefit.description || ''
                }))
              : [],
            cooking_steps: Array.isArray(savedRecipe.cooking_steps)
              ? savedRecipe.cooking_steps.map((step: any, index: number) => ({
                  step: Number(step.step) || index + 1,
                  description: step.description || '',
                  duration: step.duration ? Number(step.duration) : undefined,
                  tips: step.tips || undefined
                }))
              : []
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