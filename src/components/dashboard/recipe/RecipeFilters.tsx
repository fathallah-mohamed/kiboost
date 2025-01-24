import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { MealType, Difficulty } from "../types";

interface RecipeFiltersProps {
  mealType: MealType | "all";
  setMealType: (value: MealType | "all") => void;
  maxPrepTime: number;
  setMaxPrepTime: (value: number) => void;
  difficulty: Difficulty | "all";
  setDifficulty: (value: Difficulty | "all") => void;
}

export const RecipeFilters = ({
  mealType,
  setMealType,
  maxPrepTime,
  setMaxPrepTime,
  difficulty,
  setDifficulty,
}: RecipeFiltersProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="space-y-2">
        <Label>Type de repas</Label>
        <Select value={mealType} onValueChange={(value: MealType | "all") => setMealType(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="breakfast">Petit-déjeuner</SelectItem>
            <SelectItem value="lunch">Déjeuner</SelectItem>
            <SelectItem value="dinner">Dîner</SelectItem>
            <SelectItem value="snack">Collation</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Temps de préparation maximum ({maxPrepTime} min)</Label>
        <Slider
          value={[maxPrepTime]}
          onValueChange={(values) => setMaxPrepTime(values[0])}
          min={10}
          max={120}
          step={5}
          className="py-4"
        />
      </div>

      <div className="space-y-2">
        <Label>Difficulté</Label>
        <Select value={difficulty} onValueChange={(value: Difficulty | "all") => setDifficulty(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner une difficulté" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            <SelectItem value="easy">Facile</SelectItem>
            <SelectItem value="medium">Moyen</SelectItem>
            <SelectItem value="hard">Difficile</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};