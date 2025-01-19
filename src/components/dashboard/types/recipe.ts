export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type SpecialOccasion = 'birthday' | 'school' | 'quick' | 'party' | 'holiday';

export interface RecipeFilters {
  mealType?: MealType;
  maxPrepTime?: number;
  difficulty?: Difficulty;
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
