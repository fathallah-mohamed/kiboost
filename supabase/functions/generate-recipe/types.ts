export interface ChildProfile {
  profile_id: string;
  age: number;
  allergies?: string[];
  preferences?: string[];
}

export interface RecipeFilters {
  mealType?: string;
  maxPrepTime?: number;
  difficulty?: string;
}

export interface OpenAIResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
}