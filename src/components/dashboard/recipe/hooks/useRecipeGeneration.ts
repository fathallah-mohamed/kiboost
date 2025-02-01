import { useState } from "react";
import { Recipe, MealType, Difficulty, HealthBenefitCategory, RecipeFilters } from "../../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

interface Ingredient {
  item: string;
  quantity: string;
  unit: string;
}

interface NutritionalInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface CookingStep {
  step: number;
  description: string;
  duration?: number;
  tips?: string;
}

interface HealthBenefit {
  icon: string;
  category: HealthBenefitCategory;
  description: string;
}

const validateMealType = (type: string): MealType => {
  const validTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];
  return validTypes.includes(type as MealType) ? (type as MealType) : 'dinner';
};

const validateDifficulty = (difficulty: string): Difficulty => {
  const validDifficulties: Difficulty[] = ['easy', 'medium', 'hard'];
  return validDifficulties.includes(difficulty as Difficulty) ? (difficulty as Difficulty) : 'medium';
};

const parseIngredients = (ingredients: Json): Ingredient[] => {
  if (!Array.isArray(ingredients)) return [];
  
  return ingredients.map(ing => {
    if (typeof ing === 'object' && ing !== null) {
      const ingredient = ing as Record<string, unknown>;
      return {
        item: String(ingredient.item || ''),
        quantity: String(ingredient.quantity || ''),
        unit: String(ingredient.unit || '')
      };
    }
    return { item: '', quantity: '', unit: '' };
  });
};

const parseNutritionalInfo = (info: Json): NutritionalInfo => {
  if (typeof info !== 'object' || !info || Array.isArray(info)) {
    return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  }

  const nutritionalInfo = info as Record<string, unknown>;
  return {
    calories: Number(nutritionalInfo.calories) || 0,
    protein: Number(nutritionalInfo.protein) || 0,
    carbs: Number(nutritionalInfo.carbs) || 0,
    fat: Number(nutritionalInfo.fat) || 0
  };
};

const parseCookingSteps = (steps: Json): CookingStep[] => {
  if (!Array.isArray(steps)) return [];

  return steps.map(step => {
    if (typeof step === 'object' && step !== null) {
      const cookingStep = step as Record<string, unknown>;
      return {
        step: Number(cookingStep.step) || 0,
        description: String(cookingStep.description || ''),
        duration: cookingStep.duration ? Number(cookingStep.duration) : undefined,
        tips: cookingStep.tips ? String(cookingStep.tips) : undefined
      };
    }
    return { step: 0, description: '' };
  });
};

const parseHealthBenefits = (benefits: Json): HealthBenefit[] => {
  if (!Array.isArray(benefits)) return [];

  return benefits.map(benefit => {
    if (typeof benefit === 'object' && benefit !== null) {
      const healthBenefit = benefit as Record<string, unknown>;
      const category = String(healthBenefit.category || '');
      
      const validCategory = ['cognitive', 'energy', 'satiety', 'digestive', 'immunity',
        'growth', 'mental', 'organs', 'beauty', 'physical', 'prevention', 'global'].includes(category) 
        ? (category as HealthBenefitCategory) 
        : 'global';

      return {
        icon: String(healthBenefit.icon || ''),
        category: validCategory,
        description: String(healthBenefit.description || '')
      };
    }
    return { icon: '', category: 'global', description: '' };
  });
};

export const useRecipeGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateRecipes = async (child: { id: string; name: string; birth_date: string; allergies?: string[]; preferences?: string[]; profile_id: string }, filters: RecipeFilters) => {
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

      if (generateError) throw generateError;
      console.log("Generated recipe response:", response);

      if (!response?.recipes || !Array.isArray(response.recipes)) {
        throw new Error("Format de réponse invalide");
      }

      const savedRecipes: Recipe[] = [];

      for (const recipe of response.recipes) {
        try {
          console.log("Processing recipe:", recipe);

          const recipeData = {
            profile_id: child.profile_id,
            child_id: child.id,
            name: String(recipe.name),
            ingredients: JSON.stringify(parseIngredients(recipe.ingredients)),
            instructions: Array.isArray(recipe.instructions) ? recipe.instructions : [String(recipe.instructions)],
            nutritional_info: JSON.stringify(parseNutritionalInfo(recipe.nutritional_info)),
            meal_type: validateMealType(recipe.meal_type),
            preparation_time: Number(recipe.preparation_time) || 30,
            max_prep_time: Number(filters.maxPrepTime) || 30,
            difficulty: validateDifficulty(recipe.difficulty),
            servings: Number(recipe.servings) || 4,
            auto_generated: true,
            source: 'ia',
            health_benefits: JSON.stringify(parseHealthBenefits(recipe.health_benefits)),
            cooking_steps: JSON.stringify(parseCookingSteps(recipe.cooking_steps)),
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
            // Parse the JSON strings back into objects for the Recipe type
            const parsedRecipe: Recipe = {
              ...savedRecipe,
              ingredients: JSON.parse(savedRecipe.ingredients as string),
              instructions: Array.isArray(savedRecipe.instructions) 
                ? savedRecipe.instructions 
                : [savedRecipe.instructions],
              nutritional_info: JSON.parse(savedRecipe.nutritional_info as string),
              health_benefits: savedRecipe.health_benefits ? JSON.parse(savedRecipe.health_benefits as string) : [],
              cooking_steps: savedRecipe.cooking_steps ? JSON.parse(savedRecipe.cooking_steps as string) : []
            };
            savedRecipes.push(parsedRecipe);
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