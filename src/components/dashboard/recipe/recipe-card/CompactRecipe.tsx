import { Clock, Award, Star, Flame, Coffee, Utensils, Moon } from "lucide-react";
import { Recipe } from "../../types";

interface CompactRecipeProps {
  recipe: Recipe;
}

const getDifficultyIcon = (difficulty: string) => {
  switch (difficulty) {
    case "easy":
      return <Award className="w-3 h-3" />;
    case "medium":
      return <Star className="w-3 h-3" />;
    case "hard":
      return <Flame className="w-3 h-3" />;
    default:
      return <Star className="w-3 h-3" />;
  }
};

const getMealTypeIcon = (mealType: string) => {
  switch (mealType) {
    case "breakfast":
      return <Coffee className="w-3 h-3" />;
    case "lunch":
      return <Utensils className="w-3 h-3" />;
    case "dinner":
      return <Moon className="w-3 h-3" />;
    case "snack":
      return <Coffee className="w-3 h-3" />;
    default:
      return <Utensils className="w-3 h-3" />;
  }
};

const getDifficultyLabel = (difficulty: string) => {
  const labels = {
    easy: "Facile",
    medium: "Moyen",
    hard: "Difficile"
  };
  return labels[difficulty as keyof typeof labels] || difficulty;
};

const getMealTypeLabel = (mealType: string) => {
  const labels = {
    breakfast: "Petit-déjeuner",
    lunch: "Déjeuner",
    dinner: "Dîner",
    snack: "Goûter"
  };
  return labels[mealType as keyof typeof labels] || mealType;
};

export const CompactRecipe = ({ recipe }: CompactRecipeProps) => {
  return (
    <div className="space-y-2">
      <h4 className="font-medium text-sm">{recipe.name}</h4>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {recipe.preparation_time} min
        </span>
        <span className="flex items-center gap-1">
          {getDifficultyIcon(recipe.difficulty)}
          {getDifficultyLabel(recipe.difficulty)}
        </span>
        <span className="flex items-center gap-1">
          {getMealTypeIcon(recipe.meal_type)}
          {getMealTypeLabel(recipe.meal_type)}
        </span>
      </div>
    </div>
  );
};