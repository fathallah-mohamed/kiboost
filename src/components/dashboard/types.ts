export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  allergies: string[];
  preferences: string[];
}

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
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  preparation_time: number;
  difficulty: 'easy' | 'medium' | 'hard';
  servings: number;
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