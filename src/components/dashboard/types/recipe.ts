import { HealthBenefit } from './health';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Recipe {
  id: string;
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
  meal_type: MealType;
  preparation_time: number;
  difficulty: Difficulty;
  servings: number;
  image_url?: string;
  is_generated?: boolean;
  created_at: string;
  updated_at: string;
  profile_id: string;
  health_benefits?: HealthBenefit[];
  min_age?: number;
  max_age?: number;
  dietary_preferences?: string[];
  allergens?: string[];
  cost_estimate?: number;
  seasonal_months?: number[];
  cooking_steps?: Array<{
    step: number;
    description: string;
    duration?: number;
    tips?: string;
  }>;
}

export interface RecipeFilters {
  mealType?: MealType;
  maxPrepTime?: number;
  difficulty?: Difficulty;
  minAge?: number;
  maxAge?: number;
  dietaryPreferences?: string[];
  excludedAllergens?: string[];
  maxCost?: number;
  season?: number;
}