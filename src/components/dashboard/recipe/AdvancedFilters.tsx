import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  Filter, 
  Heart,
  Leaf 
} from "lucide-react";
import { RecipeFilters, MealType, Difficulty } from "../types";

interface AdvancedFiltersProps {
  filters: RecipeFilters;
  onFiltersChange: (filters: RecipeFilters) => void;
}

const dietaryOptions = [
  "végétarien",
  "végétalien",
  "sans gluten",
  "sans lactose",
  "halal",
  "casher",
];

const allergenOptions = [
  "arachides",
  "fruits à coque",
  "lait",
  "œufs",
  "poisson",
  "crustacés",
  "soja",
  "blé",
];

export const AdvancedFilters = ({ 
  filters, 
  onFiltersChange 
}: AdvancedFiltersProps) => {
  const handleFilterChange = (
    key: keyof RecipeFilters, 
    value: any
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const currentMonth = new Date().getMonth() + 1;

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Filtres avancés</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Âge */}
        <div className="space-y-2">
          <Label>Âge de l'enfant</Label>
          <div className="flex items-center gap-4">
            <Input
              type="number"
              min={0}
              max={18}
              value={filters.minAge || 0}
              onChange={(e) => handleFilterChange('minAge', parseInt(e.target.value))}
              className="w-20"
            />
            <span>à</span>
            <Input
              type="number"
              min={0}
              max={18}
              value={filters.maxAge || 18}
              onChange={(e) => handleFilterChange('maxAge', parseInt(e.target.value))}
              className="w-20"
            />
            <span>ans</span>
          </div>
        </div>

        {/* Type de repas */}
        <div className="space-y-2">
          <Label>Type de repas</Label>
          <Select 
            value={filters.mealType || "all"} 
            onValueChange={(value) => handleFilterChange('mealType', value === "all" ? undefined : value as MealType)}
          >
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

        {/* Temps de préparation */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Temps de préparation max: {filters.maxPrepTime || 60}min
          </Label>
          <Slider
            value={[filters.maxPrepTime || 60]}
            onValueChange={([value]) => handleFilterChange('maxPrepTime', value)}
            min={10}
            max={120}
            step={5}
          />
        </div>

        {/* Difficulté */}
        <div className="space-y-2">
          <Label>Niveau de difficulté</Label>
          <Select 
            value={filters.difficulty || "all"} 
            onValueChange={(value) => handleFilterChange('difficulty', value === "all" ? undefined : value as Difficulty)}
          >
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

        {/* Préférences alimentaires */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Leaf className="w-4 h-4" />
            Préférences alimentaires
          </Label>
          <div className="flex flex-wrap gap-2">
            {dietaryOptions.map((pref) => (
              <Badge
                key={pref}
                variant={filters.dietaryPreferences?.includes(pref) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => {
                  const current = filters.dietaryPreferences || [];
                  const updated = current.includes(pref)
                    ? current.filter(p => p !== pref)
                    : [...current, pref];
                  handleFilterChange('dietaryPreferences', updated);
                }}
              >
                {pref}
              </Badge>
            ))}
          </div>
        </div>

        {/* Allergènes à exclure */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Allergènes à exclure
          </Label>
          <div className="flex flex-wrap gap-2">
            {allergenOptions.map((allergen) => (
              <Badge
                key={allergen}
                variant={filters.excludedAllergens?.includes(allergen) ? "destructive" : "outline"}
                className="cursor-pointer"
                onClick={() => {
                  const current = filters.excludedAllergens || [];
                  const updated = current.includes(allergen)
                    ? current.filter(a => a !== allergen)
                    : [...current, allergen];
                  handleFilterChange('excludedAllergens', updated);
                }}
              >
                {allergen}
              </Badge>
            ))}
          </div>
        </div>

        {/* Budget */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Budget maximum par portion
          </Label>
          <Slider
            value={[filters.maxCost || 15]}
            onValueChange={([value]) => handleFilterChange('maxCost', value)}
            min={5}
            max={30}
            step={1}
          />
          <div className="text-sm text-muted-foreground">
            {filters.maxCost || 15}€ par portion
          </div>
        </div>

        {/* Saisonnalité */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Saisonnalité
          </Label>
          <Select 
            value={String(filters.season || currentMonth)} 
            onValueChange={(value) => handleFilterChange('season', parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choisir un mois" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Janvier</SelectItem>
              <SelectItem value="2">Février</SelectItem>
              <SelectItem value="3">Mars</SelectItem>
              <SelectItem value="4">Avril</SelectItem>
              <SelectItem value="5">Mai</SelectItem>
              <SelectItem value="6">Juin</SelectItem>
              <SelectItem value="7">Juillet</SelectItem>
              <SelectItem value="8">Août</SelectItem>
              <SelectItem value="9">Septembre</SelectItem>
              <SelectItem value="10">Octobre</SelectItem>
              <SelectItem value="11">Novembre</SelectItem>
              <SelectItem value="12">Décembre</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={() => onFiltersChange({})}
          className="mr-2"
        >
          Réinitialiser les filtres
        </Button>
      </div>
    </Card>
  );
};