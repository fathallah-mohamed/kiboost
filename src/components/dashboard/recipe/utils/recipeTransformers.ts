import { MealType, Difficulty, Recipe } from "../../types";
import { Json } from "@/integrations/supabase/types";

export const validateMealType = (type: string): MealType => {
  const validTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];
  return validTypes.includes(type as MealType) ? type as MealType : 'dinner';
};

export const validateDifficulty = (level: string): Difficulty => {
  const validLevels: Difficulty[] = ['easy', 'medium', 'hard'];
  return validLevels.includes(level as Difficulty) ? level as Difficulty : 'medium';
};

export interface GeneratedRecipe {
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
  image_url?: string;
  health_benefits?: any[];
  min_age?: number;
  max_age?: number;
  dietary_preferences?: string[];
  allergens?: string[];
  cost_estimate?: number;
  seasonal_months?: number[];
  cooking_steps?: any[];
}

export const transformToRecipeData = (recipe: GeneratedRecipe, profileId: string) => {
  return {
    profile_id: profileId,
    name: recipe.name,
    ingredients: JSON.stringify(recipe.ingredients),
    instructions: JSON.stringify(recipe.instructions),
    nutritional_info: JSON.stringify(recipe.nutritional_info),
    meal_type: validateMealType(recipe.meal_type),
    preparation_time: Number(recipe.preparation_time) || 30,
    difficulty: validateDifficulty(recipe.difficulty),
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
};