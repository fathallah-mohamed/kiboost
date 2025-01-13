import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";
import { Recipe, ChildProfile, RecipeFilters, MealType, Difficulty } from "../types";

export const useRecipeGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const validateMealType = (mealType: string): MealType => {
    const validMealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];
    return validMealTypes.includes(mealType as MealType) 
      ? mealType as MealType 
      : 'dinner';
  };

  const validateDifficulty = (difficulty: string): Difficulty => {
    const validDifficulties: Difficulty[] = ['easy', 'medium', 'hard'];
    return validDifficulties.includes(difficulty as Difficulty) 
      ? difficulty as Difficulty 
      : 'medium';
  };

  const generateRecipes = async (selectedChild: ChildProfile, filters?: RecipeFilters) => {
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Non authentifié");

      // Récupérer les recettes déjà planifiées
      const { data: plannedRecipes } = await supabase
        .from('meal_plans')
        .select('recipe_id')
        .eq('profile_id', session.user.id);

      const plannedRecipeIds = plannedRecipes?.map(plan => plan.recipe_id) || [];

      const recipePromises = Array(3).fill(null).map(async () => {
        const response = await supabase.functions.invoke('generate-recipe', {
          body: {
            childProfile: {
              age: selectedChild.age,
              allergies: selectedChild.allergies,
              preferences: selectedChild.preferences,
            },
            filters,
            excludeRecipes: plannedRecipeIds,
          },
        });

        if (response.error) throw response.error;
        
        const recipeData = {
          ...response.data,
          profile_id: session.user.id,
          is_generated: true,
          meal_type: validateMealType(response.data.meal_type),
          difficulty: validateDifficulty(response.data.difficulty),
        };

        const { data: savedRecipe, error: saveError } = await supabase
          .from('recipes')
          .insert([recipeData])
          .select()
          .single();

        if (saveError) throw saveError;

        const recipe: Recipe = {
          id: savedRecipe.id,
          name: savedRecipe.name,
          ingredients: typeof savedRecipe.ingredients === 'string' 
            ? JSON.parse(savedRecipe.ingredients) 
            : savedRecipe.ingredients,
          instructions: Array.isArray(savedRecipe.instructions)
            ? savedRecipe.instructions
            : [savedRecipe.instructions].filter(Boolean),
          nutritional_info: typeof savedRecipe.nutritional_info === 'string'
            ? JSON.parse(savedRecipe.nutritional_info)
            : savedRecipe.nutritional_info,
          meal_type: validateMealType(savedRecipe.meal_type),
          preparation_time: savedRecipe.preparation_time,
          difficulty: validateDifficulty(savedRecipe.difficulty),
          servings: savedRecipe.servings,
          image_url: savedRecipe.image_url,
          is_generated: savedRecipe.is_generated,
          created_at: savedRecipe.created_at,
          updated_at: savedRecipe.updated_at,
          profile_id: savedRecipe.profile_id,
        };

        return recipe;
      });

      const generatedRecipes = await Promise.all(recipePromises);
      setRecipes(prev => [...prev, ...generatedRecipes]);
      
      toast({
        title: "Recettes générées",
        description: `${generatedRecipes.length} nouvelles recettes ont été créées pour ${selectedChild.name}`,
      });
    } catch (error: any) {
      console.error('Error generating recipes:', error);
      setError(error.message || "Une erreur est survenue lors de la génération des recettes");
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de générer les recettes. Veuillez réessayer.",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    recipes,
    error,
    generateRecipes,
  };
};