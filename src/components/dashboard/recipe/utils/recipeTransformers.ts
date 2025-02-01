import { MealType, Difficulty, Recipe, HealthBenefitCategory } from "../../types";
import { validateMealType, validateDifficulty } from './validationUtils';
import { Json } from "@/integrations/supabase/types";

export type RecipeIngredient = {
  item: string;
  quantity: string;
  unit: string;
};

export const parseIngredients = (ingredients: Json): RecipeIngredient[] => {
  if (Array.isArray(ingredients)) {
    return ingredients.map(ing => {
      const item = ing as { [key: string]: Json };
      return {
        item: String(item?.item || ''),
        quantity: String(item?.quantity || ''),
        unit: String(item?.unit || '')
      };
    });
  }
  return [];
};

export const parseInstructions = (instructions: Json): string[] => {
  if (Array.isArray(instructions)) {
    return instructions.map(String);
  }
  if (typeof instructions === 'string') {
    try {
      const parsed = JSON.parse(instructions);
      return Array.isArray(parsed) ? parsed.map(String) : [String(instructions)];
    } catch {
      return [String(instructions)];
    }
  }
  return [];
};

export const parseNutritionalInfo = (info: Json) => {
  const defaultInfo = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  };

  if (typeof info === 'object' && info !== null && !Array.isArray(info)) {
    const nutritionalInfo = info as { [key: string]: Json };
    return {
      calories: Number(nutritionalInfo?.calories || 0),
      protein: Number(nutritionalInfo?.protein || 0),
      carbs: Number(nutritionalInfo?.carbs || 0),
      fat: Number(nutritionalInfo?.fat || 0)
    };
  }
  return defaultInfo;
};

export const parseHealthBenefits = (benefits: Json) => {
  if (Array.isArray(benefits)) {
    return benefits.map(benefit => {
      const b = benefit as { [key: string]: Json };
      return {
        icon: String(b?.icon || ''),
        category: String(b?.category || '') as HealthBenefitCategory,
        description: String(b?.description || '')
      };
    });
  }
  return [];
};

export const parseCookingSteps = (steps: Json) => {
  if (Array.isArray(steps)) {
    return steps.map(step => {
      const s = step as { [key: string]: Json };
      return {
        step: Number(s?.step || 0),
        description: String(s?.description || ''),
        duration: Number(s?.duration || 0),
        tips: String(s?.tips || '')
      };
    });
  }
  return [];
};

export const transformToRecipe = (dbRecipe: any): Recipe => {
  return {
    ...dbRecipe,
    ingredients: parseIngredients(dbRecipe.ingredients),
    instructions: parseInstructions(dbRecipe.instructions),
    nutritional_info: parseNutritionalInfo(dbRecipe.nutritional_info),
    health_benefits: parseHealthBenefits(dbRecipe.health_benefits),
    cooking_steps: parseCookingSteps(dbRecipe.cooking_steps),
    meal_type: validateMealType(dbRecipe.meal_type) as MealType,
    difficulty: validateDifficulty(dbRecipe.difficulty) as Difficulty
  };
};