import { MealType, Difficulty } from "../../types";

export const validateMealType = (type: string): MealType => {
  const validTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];
  return validTypes.includes(type as MealType) ? type as MealType : 'dinner';
};

export const validateDifficulty = (level: string): Difficulty => {
  const validLevels: Difficulty[] = ['easy', 'medium', 'hard'];
  return validLevels.includes(level as Difficulty) ? level as Difficulty : 'medium';
};

export const validateHealthBenefits = (benefits: any[]) => {
  const validCategories = [
    'cognitive', 'energy', 'satiety', 'digestive', 'immunity',
    'growth', 'mental', 'organs', 'beauty', 'physical',
    'prevention', 'global'
  ];

  return benefits.every(benefit => 
    typeof benefit === 'object' &&
    'category' in benefit &&
    validCategories.includes(benefit.category)
  );
};

export const validateIngredients = (ingredients: any[]): boolean => {
  return ingredients.every(ingredient =>
    typeof ingredient === 'object' &&
    'item' in ingredient &&
    'quantity' in ingredient &&
    'unit' in ingredient
  );
};