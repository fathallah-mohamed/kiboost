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
}