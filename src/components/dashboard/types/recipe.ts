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
}

export interface RecipeRating {
  id: string;
  recipe_id: string;
  profile_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface RecipeFavorite {
  id: string;
  recipe_id: string;
  profile_id: string;
  created_at: string;
}

export interface RecipeFilters {
  mealType?: MealType;
  maxPrepTime?: number;
  difficulty?: Difficulty;
}

export interface RecipeCardProps {
  recipe: Recipe;
  isPlanned?: boolean;
  onAdd?: (recipe: Recipe) => void;
  compact?: boolean;
}