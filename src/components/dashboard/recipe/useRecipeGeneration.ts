import { useState } from 'react';
import { Recipe, ChildProfile, RecipeFilters } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useRecipeGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateRecipes = async (child: ChildProfile, filters: RecipeFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Generating recipes with filters:', filters);
      
      const { data: existingRecipes } = await supabase
        .from('recipes')
        .select('name')
        .eq('profile_id', (await supabase.auth.getSession()).data.session?.user.id);

      const { data: generatedRecipes, error: functionError } = await supabase.functions.invoke('generate-recipe', {
        body: { 
          childProfiles: [child],
          filters: {
            mealType: filters.mealType || 'all',
            maxPrepTime: filters.maxPrepTime || 60,
            difficulty: filters.difficulty || 'all',
            dietaryPreferences: filters.dietaryPreferences || [],
            excludedAllergens: filters.excludedAllergens || [],
            maxCost: filters.maxCost || 15,
            healthBenefits: filters.healthBenefits || [],
            season: filters.season || null,
            includedIngredients: filters.includedIngredients || [],
            excludedIngredients: filters.excludedIngredients || []
          }
        }
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

      // Filtrer les recettes similaires
      const uniqueRecipes = generatedRecipes.filter(recipe => 
        !existingRecipes?.some(existing => 
          areRecipesSimilar(recipe.name, existing.name)
        )
      );

      if (uniqueRecipes.length === 0) {
        toast.error("Toutes les recettes générées sont similaires à des recettes existantes. Réessayez !");
        return [];
      }

      const savedRecipes = await Promise.all(
        uniqueRecipes.map(async (recipe: any) => {
          const recipeData = {
            profile_id: userId,
            name: recipe.name,
            ingredients: recipe.ingredients,
            instructions: recipe.instructions.map((instruction: string, index: number) => 
              `${index + 1}. ${instruction}`
            ).join('\n'),
            nutritional_info: recipe.nutritional_info,
            meal_type: recipe.meal_type,
            preparation_time: recipe.preparation_time,
            difficulty: recipe.difficulty,
            servings: recipe.servings,
            is_generated: true,
            health_benefits: recipe.health_benefits || [],
            cooking_steps: [],
            min_age: 0,
            max_age: 18,
            dietary_preferences: filters.dietaryPreferences || [],
            allergens: filters.excludedAllergens || [],
            cost_estimate: filters.maxCost || 0,
            seasonal_months: filters.season ? [filters.season] : [1,2,3,4,5,6,7,8,9,10,11,12]
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
            health_benefits: recipe.health_benefits || [],
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

const normalizeRecipeName = (name: string): string => {
  return name.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .trim();
};

const areRecipesSimilar = (recipe1: string, recipe2: string): boolean => {
  const name1 = normalizeRecipeName(recipe1);
  const name2 = normalizeRecipeName(recipe2);
  
  const words1 = new Set(name1.split(' '));
  const words2 = new Set(name2.split(' '));
  const commonWords = [...words1].filter(word => words2.has(word));
  
  return commonWords.length / Math.max(words1.size, words2.size) > 0.7;
};