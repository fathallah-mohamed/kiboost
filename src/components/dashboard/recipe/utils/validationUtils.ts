import { MealType, Difficulty } from "../../types";

export const validateMealType = (type: string): MealType => {
  const validTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];
  return validTypes.includes(type as MealType) ? type as MealType : 'dinner';
};

export const validateDifficulty = (level: string): Difficulty => {
  const validLevels: Difficulty[] = ['easy', 'medium', 'hard'];
  return validLevels.includes(level as Difficulty) ? level as Difficulty : 'medium';
};