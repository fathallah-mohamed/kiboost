import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Clock, ChefHat, UtensilsCrossed } from "lucide-react";

interface RecipeFiltersProps {
  mealType: string;
  setMealType: (value: string) => void;
  maxPrepTime: number;
  setMaxPrepTime: (value: number) => void;
  difficulty: string;
  setDifficulty: (value: string) => void;
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
    <div className="space-y-4 p-4 bg-secondary/10 rounded-lg">
      <h3 className="font-medium mb-4">Filtres</h3>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <UtensilsCrossed className="w-4 h-4" />
            Type de repas
          </label>
          <Select value={mealType} onValueChange={setMealType}>
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
          <label className="text-sm font-medium flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Temps de préparation max: {maxPrepTime} min
          </label>
          <Slider
            value={[maxPrepTime]}
            onValueChange={([value]) => setMaxPrepTime(value)}
            max={120}
            step={5}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <ChefHat className="w-4 h-4" />
            Niveau de difficulté
          </label>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un niveau" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="easy">Facile</SelectItem>
              <SelectItem value="medium">Moyen</SelectItem>
              <SelectItem value="hard">Difficile</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};