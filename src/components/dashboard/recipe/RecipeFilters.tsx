import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Clock, ChevronUp, ChevronDown } from "lucide-react";
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
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 45, label: "45 minutes" },
  { value: 60, label: "1 heure" },
  { value: 90, label: "1h30" },
  { value: 120, label: "2 heures" },
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
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="all" />
            <Label htmlFor="all">Tous</Label>
          </div>
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
        <div className="relative">
          <Button
            variant="outline"
            className="w-full justify-between"
            onClick={() => setShowTimeOptions(!showTimeOptions)}
          >
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              {maxPrepTime} minutes
            </span>
            {showTimeOptions ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
          {showTimeOptions && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
              <div className="p-2 grid grid-cols-2 gap-1">
                {timeOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant="ghost"
                    className="justify-start"
                    onClick={() => {
                      setMaxPrepTime(option.value);
                      setShowTimeOptions(false);
                    }}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Difficulté</Label>
        <RadioGroup 
          value={difficulty} 
          onValueChange={(value: Difficulty | "all") => setDifficulty(value)}
          className="grid grid-cols-2 gap-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="diff-all" />
            <Label htmlFor="diff-all">Toutes</Label>
          </div>
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