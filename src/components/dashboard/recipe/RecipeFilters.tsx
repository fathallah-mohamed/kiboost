import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Clock, Utensils, ChevronUp, ChevronDown } from "lucide-react";
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

export const RecipeFilters = ({
  mealType,
  setMealType,
  maxPrepTime,
  setMaxPrepTime,
  difficulty,
  setDifficulty,
}: RecipeFiltersProps) => {
  const [showTimeOptions, setShowTimeOptions] = useState(false);

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="space-y-2">
        <Label>Type de repas</Label>
        <RadioGroup 
          value={mealType} 
          onValueChange={(value: MealType | "all") => setMealType(value)}
          className="grid grid-cols-2 gap-2"
          defaultValue="breakfast"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="breakfast" id="breakfast" />
            <Label htmlFor="breakfast">Petit-déjeuner</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="lunch" id="lunch" />
            <Label htmlFor="lunch">Déjeuner</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="dinner" id="dinner" />
            <Label htmlFor="dinner">Dîner</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="snack" id="snack" />
            <Label htmlFor="snack">Collation</Label>
          </div>
        </RadioGroup>
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
        <RadioGroup 
          value={difficulty} 
          onValueChange={(value: Difficulty | "all") => setDifficulty(value)}
          className="grid grid-cols-2 gap-2"
          defaultValue="easy"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="easy" id="easy" />
            <Label htmlFor="easy">Facile</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="medium" id="medium" />
            <Label htmlFor="medium">Moyen</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="hard" id="hard" />
            <Label htmlFor="hard">Difficile</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
};