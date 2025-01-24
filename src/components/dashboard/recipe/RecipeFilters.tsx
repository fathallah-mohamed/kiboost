import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Clock, Utensils, ChevronUp, ChevronDown, Mountain } from "lucide-react";
import { MealType, Difficulty } from "../types";
import { useState } from "react";

interface RecipeFiltersProps {
  mealType: MealType | "all";
  setMealType: (value: MealType | "all") => void;
  maxPrepTime: number;
  setMaxPrepTime: (value: number) => void;
  difficulty: Difficulty | "all";
  setDifficulty: (value: Difficulty | "all") => void;
}

const timeOptions = [
  { value: 15, label: "<15 minutes" },
  { value: 30, label: "15-30 minutes" },
  { value: 45, label: "30-45 minutes" },
  { value: 60, label: "45-60 minutes" },
  { value: 90, label: "1h-1h30" },
  { value: 120, label: ">1h30" },
];

const mealTypeOptions = [
  { value: "breakfast", label: "Petit-déjeuner", icon: <Utensils className="w-4 h-4" /> },
  { value: "lunch", label: "Déjeuner", icon: <Utensils className="w-4 h-4" /> },
  { value: "dinner", label: "Dîner", icon: <Utensils className="w-4 h-4" /> },
  { value: "snack", label: "Collation", icon: <Utensils className="w-4 h-4" /> },
];

const difficultyOptions = [
  { value: "easy", label: "Facile", icon: <ChevronDown className="w-4 h-4" /> },
  { value: "medium", label: "Moyen", icon: <Mountain className="w-4 h-4" /> },
  { value: "hard", label: "Difficile", icon: <ChevronUp className="w-4 h-4" /> },
];

export const RecipeFilters = ({
  mealType,
  setMealType,
  maxPrepTime,
  setMaxPrepTime,
  difficulty,
  setDifficulty,
}: RecipeFiltersProps) => {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="space-y-2">
        <Label>Type de repas</Label>
        <div className="grid grid-cols-2 gap-2">
          {mealTypeOptions.map((option) => (
            <Button
              key={option.value}
              variant={mealType === option.value ? "default" : "outline"}
              onClick={() => setMealType(option.value as MealType)}
              className="w-full justify-start gap-2"
            >
              {option.icon}
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Temps de préparation</Label>
        <div className="grid grid-cols-2 gap-2">
          {timeOptions.map((option) => (
            <Button
              key={option.value}
              variant={maxPrepTime === option.value ? "default" : "outline"}
              onClick={() => setMaxPrepTime(option.value)}
              className="w-full justify-start gap-2"
            >
              <Clock className="w-4 h-4" />
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Difficulté</Label>
        <div className="grid grid-cols-2 gap-2">
          {difficultyOptions.map((option) => (
            <Button
              key={option.value}
              variant={difficulty === option.value ? "default" : "outline"}
              onClick={() => setDifficulty(option.value as Difficulty)}
              className="w-full justify-start gap-2"
            >
              {option.icon}
              {option.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};