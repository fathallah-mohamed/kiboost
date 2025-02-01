import { Json } from "@/integrations/supabase/types";
import { Recipe, RecipeIngredient, NutritionalInfo } from "../../types";

type JsonObject = { [key: string]: Json };

const defaultInfo: NutritionalInfo = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0
};

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

export const parseHealthBenefits = (benefits: Json) => {
  try {
    if (typeof benefits === 'string') {
      return JSON.parse(benefits);
    }
    if (Array.isArray(benefits)) {
      return benefits;
    }
    return [];
  } catch (error) {
    console.error('Error parsing health benefits:', error);
    return [];
  }
};

export const parseNutritionalInfo = (info: Json): NutritionalInfo => {
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

export const transformToRecipe = (data: any): Recipe => {
  return {
    id: data.id,
    profile_id: data.profile_id,
    name: data.name,
    ingredients: parseIngredients(data.ingredients),
    instructions: String(data.instructions || ''),
    nutritional_info: parseNutritionalInfo(data.nutritional_info),
    meal_type: data.meal_type || 'dinner',
    preparation_time: Number(data.preparation_time || 30),
    difficulty: data.difficulty || 'medium',
    servings: Number(data.servings || 4),
    health_benefits: parseHealthBenefits(data.health_benefits),
    image_url: data.image_url,
    min_age: Number(data.min_age || 0),
    max_age: Number(data.max_age || 18),
    dietary_preferences: Array.isArray(data.dietary_preferences) ? data.dietary_preferences : [],
    allergens: Array.isArray(data.allergens) ? data.allergens : [],
    cost_estimate: Number(data.cost_estimate || 0),
    seasonal_months: Array.isArray(data.seasonal_months) ? data.seasonal_months : [1,2,3,4,5,6,7,8,9,10,11,12],
    cooking_steps: data.cooking_steps || [],
    is_generated: Boolean(data.is_generated),
    max_prep_time: Number(data.max_prep_time || 30)
  };
};