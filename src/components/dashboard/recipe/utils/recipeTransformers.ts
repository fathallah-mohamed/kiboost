import { MealType, Difficulty, Recipe } from "../../types";
import { validateMealType, validateDifficulty } from './validationUtils';
import { Json } from "@/integrations/supabase/types";

export type RecipeIngredient = {
  item: string;
  quantity: string;
  unit: string;
};

type JsonObject = { [key: string]: Json };

export const parseIngredients = (ingredients: Json): RecipeIngredient[] => {
  try {
    if (typeof ingredients === 'string') {
      return JSON.parse(ingredients);
    }
    if (Array.isArray(ingredients)) {
      return ingredients.map(ing => {
        if (typeof ing === 'object' && ing !== null) {
          const ingredient = ing as JsonObject;
          return {
            item: String(ingredient.item || ''),
            quantity: String(ingredient.quantity || ''),
            unit: String(ingredient.unit || '')
          };
        }
        return {
          item: '',
          quantity: '',
          unit: ''
        };
      });
    }
    return [];
  } catch (error) {
    console.error('Error parsing ingredients:', error);
    return [];
  }
};

export const parseInstructions = (instructions: string | Json): string[] => {
  try {
    if (typeof instructions === 'string') {
      return instructions.split('\n').filter(Boolean);
    }
    if (Array.isArray(instructions)) {
      return instructions.map(String);
    }
    return [];
  } catch (error) {
    console.error('Error parsing instructions:', error);
    return [];
  }
};

export const parseNutritionalInfo = (info: Json) => {
  const defaultInfo = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  };

  try {
    if (typeof info === 'string') {
      return JSON.parse(info);
    }
    if (typeof info === 'object' && info !== null && !Array.isArray(info)) {
      const nutritionalInfo = info as JsonObject;
      return {
        calories: Number(nutritionalInfo.calories || 0),
        protein: Number(nutritionalInfo.protein || 0),
        carbs: Number(nutritionalInfo.carbs || 0),
        fat: Number(nutritionalInfo.fat || 0)
      };
    }
    return defaultInfo;
  } catch (error) {
    console.error('Error parsing nutritional info:', error);
    return defaultInfo;
  }
};

export const transformToRecipe = (dbRecipe: any): Recipe => {
  return {
    id: dbRecipe.id,
    profile_id: dbRecipe.profile_id,
    name: dbRecipe.name,
    ingredients: parseIngredients(dbRecipe.ingredients),
    instructions: parseInstructions(dbRecipe.instructions),
    nutritional_info: parseNutritionalInfo(dbRecipe.nutritional_info),
    meal_type: validateMealType(dbRecipe.meal_type) as MealType,
    preparation_time: Number(dbRecipe.preparation_time) || 30,
    difficulty: validateDifficulty(dbRecipe.difficulty) as Difficulty,
    servings: Number(dbRecipe.servings) || 4,
    is_generated: Boolean(dbRecipe.is_generated),
    image_url: dbRecipe.image_url,
    health_benefits: typeof dbRecipe.health_benefits === 'string' 
      ? JSON.parse(dbRecipe.health_benefits)
      : dbRecipe.health_benefits || [],
    min_age: Number(dbRecipe.min_age) || 0,
    max_age: Number(dbRecipe.max_age) || 18,
    dietary_preferences: dbRecipe.dietary_preferences || [],
    allergens: dbRecipe.allergens || [],
    cost_estimate: Number(dbRecipe.cost_estimate) || 0,
    seasonal_months: dbRecipe.seasonal_months || [1,2,3,4,5,6,7,8,9,10,11,12],
    cooking_steps: typeof dbRecipe.cooking_steps === 'string'
      ? JSON.parse(dbRecipe.cooking_steps)
      : dbRecipe.cooking_steps || []
  };
};