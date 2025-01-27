import { MealType, Difficulty, Recipe } from "../../types";
import { validateMealType, validateDifficulty } from "./validationUtils";
import { parseJsonField } from "./jsonUtils";
import { Json } from "@/integrations/supabase/types";

export type GeneratedRecipe = {
  id: string;
  profile_id: string;
  name: string;
  ingredients: Json;
  instructions: string | string[];
  nutritional_info: Json;
  meal_type: string;
  preparation_time: number;
  difficulty: string;
  servings: number;
  is_generated?: boolean;
  image_url?: string;
  health_benefits?: Json;
  min_age?: number;
  max_age?: number;
  dietary_preferences?: string[];
  allergens?: string[];
  cost_estimate?: number;
  seasonal_months?: number[];
  cooking_steps?: any[];
  created_at: string;
  updated_at: string;
}

export const transformToRecipeData = (recipe: GeneratedRecipe, profileId: string) => {
  return {
    profile_id: profileId,
    name: recipe.name,
    ingredients: typeof recipe.ingredients === 'string' 
      ? recipe.ingredients 
      : JSON.stringify(recipe.ingredients),
    instructions: Array.isArray(recipe.instructions) 
      ? recipe.instructions.join('\n') 
      : recipe.instructions,
    nutritional_info: typeof recipe.nutritional_info === 'string'
      ? recipe.nutritional_info
      : JSON.stringify(recipe.nutritional_info),
    meal_type: validateMealType(recipe.meal_type),
    preparation_time: recipe.preparation_time || 30,
    difficulty: validateDifficulty(recipe.difficulty),
    servings: recipe.servings || 4,
    is_generated: true,
    image_url: recipe.image_url || 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
    health_benefits: recipe.health_benefits 
      ? JSON.stringify(recipe.health_benefits)
      : JSON.stringify([]),
    min_age: recipe.min_age || 0,
    max_age: recipe.max_age || 18,
    dietary_preferences: recipe.dietary_preferences || [],
    allergens: recipe.allergens || [],
    cost_estimate: recipe.cost_estimate || 0,
    seasonal_months: recipe.seasonal_months || [1,2,3,4,5,6,7,8,9,10,11,12],
    cooking_steps: recipe.cooking_steps 
      ? JSON.stringify(recipe.cooking_steps)
      : JSON.stringify([])
  };
};

export const transformDatabaseToRecipe = (dbRecipe: GeneratedRecipe): Recipe => {
  return {
    id: dbRecipe.id,
    profile_id: dbRecipe.profile_id,
    name: dbRecipe.name,
    ingredients: parseJsonField(dbRecipe.ingredients),
    instructions: Array.isArray(dbRecipe.instructions)
      ? dbRecipe.instructions
      : typeof dbRecipe.instructions === 'string'
        ? dbRecipe.instructions.split('\n')
        : [],
    nutritional_info: parseJsonField(dbRecipe.nutritional_info),
    meal_type: validateMealType(dbRecipe.meal_type),
    preparation_time: dbRecipe.preparation_time,
    difficulty: validateDifficulty(dbRecipe.difficulty),
    servings: dbRecipe.servings,
    is_generated: dbRecipe.is_generated || false,
    image_url: dbRecipe.image_url || 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
    health_benefits: parseJsonField(dbRecipe.health_benefits),
    min_age: dbRecipe.min_age || 0,
    max_age: dbRecipe.max_age || 18,
    dietary_preferences: dbRecipe.dietary_preferences || [],
    allergens: dbRecipe.allergens || [],
    cost_estimate: dbRecipe.cost_estimate || 0,
    seasonal_months: dbRecipe.seasonal_months || [1,2,3,4,5,6,7,8,9,10,11,12],
    cooking_steps: parseJsonField(dbRecipe.cooking_steps),
    created_at: dbRecipe.created_at,
    updated_at: dbRecipe.updated_at
  };
};