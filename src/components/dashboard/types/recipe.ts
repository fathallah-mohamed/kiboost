import { HealthBenefitCategory } from './health';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type SpecialOccasion = 'birthday' | 'school' | 'quick' | 'party' | 'holiday';

export type FilterMealType = MealType | 'all';
export type FilterDifficulty = Difficulty | 'all';

export interface Recipe {
  id: string;
  profile_id: string;
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
  is_generated?: boolean;
  image_url?: string;
  health_benefits?: Array<{
    icon: string;
    category: HealthBenefitCategory;
    description: string;
  }>;
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
  created_at: string;
  updated_at: string;
}

export interface RecipeFilters {
  mealType?: FilterMealType;
  maxPrepTime?: number;
  difficulty?: FilterDifficulty;
  dietaryPreferences?: string[];
  excludedAllergens?: string[];
  maxCost?: number;
  season?: number;
  healthBenefits?: string[];
  includedIngredients?: string[];
  excludedIngredients?: string[];
  totalTime?: number;
  nutritionalTargets?: {
    calories?: { min?: number; max?: number };
    protein?: { min?: number; max?: number };
    carbs?: { min?: number; max?: number };
    fat?: { min?: number; max?: number };
  };
  specialOccasion?: SpecialOccasion;
  servings?: number;
}