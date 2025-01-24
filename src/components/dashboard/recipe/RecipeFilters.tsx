import { Button } from "@/components/ui/button";
import { Clock, ChefHat, Gauge } from "lucide-react";
import { MealType, Difficulty } from "../types";
import { cn } from "@/lib/utils";

interface RecipeFiltersProps {
  mealType: MealType | "all";
  setMealType: (type: MealType | "all") => void;
  maxPrepTime: number;
  setMaxPrepTime: (time: number) => void;
  difficulty: Difficulty | "all";
  setDifficulty: (difficulty: Difficulty | "all") => void;
}

const mealTypes: { value: MealType | "all"; label: string; icon: JSX.Element }[] = [
  { value: "all", label: "Tous", icon: <ChefHat className="w-4 h-4" /> },
  { value: "breakfast", label: "Petit-déjeuner", icon: <ChefHat className="w-4 h-4" /> },
  { value: "lunch", label: "Déjeuner", icon: <ChefHat className="w-4 h-4" /> },
  { value: "dinner", label: "Dîner", icon: <ChefHat className="w-4 h-4" /> },
  { value: "snack", label: "Goûter", icon: <ChefHat className="w-4 h-4" /> },
];

const difficulties: { value: Difficulty | "all"; label: string; icon: JSX.Element }[] = [
  { value: "all", label: "Toutes", icon: <Gauge className="w-4 h-4" /> },
  { value: "easy", label: "Facile", icon: <Gauge className="w-4 h-4" /> },
  { value: "medium", label: "Moyen", icon: <Gauge className="w-4 h-4" /> },
  { value: "hard", label: "Difficile", icon: <Gauge className="w-4 h-4" /> },
];

const prepTimes = [15, 30, 45, 60];

export const RecipeFilters = ({
  mealType,
  setMealType,
  maxPrepTime,
  setMaxPrepTime,
  difficulty,
  setDifficulty,
}: RecipeFiltersProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <ChefHat className="w-4 h-4" />
          Type de repas
        </label>
        <div className="flex flex-wrap gap-2">
          {mealTypes.map((type) => (
            <Button
              key={type.value}
              variant={mealType === type.value ? "default" : "outline"}
              onClick={() => setMealType(type.value)}
              className="flex items-center gap-2"
            >
              {type.icon}
              {type.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Temps de préparation maximum
        </label>
        <div className="flex flex-wrap gap-2">
          {prepTimes.map((time) => (
            <Button
              key={time}
              variant={maxPrepTime === time ? "default" : "outline"}
              onClick={() => setMaxPrepTime(time)}
              className={cn(
                "flex items-center gap-2",
                maxPrepTime === time && "bg-primary text-primary-foreground"
              )}
            >
              <Clock className="w-4 h-4" />
              {time} min
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Gauge className="w-4 h-4" />
          Difficulté
        </label>
        <div className="flex flex-wrap gap-2">
          {difficulties.map((diff) => (
            <Button
              key={diff.value}
              variant={difficulty === diff.value ? "default" : "outline"}
              onClick={() => setDifficulty(diff.value)}
              className="flex items-center gap-2"
            >
              {diff.icon}
              {diff.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};