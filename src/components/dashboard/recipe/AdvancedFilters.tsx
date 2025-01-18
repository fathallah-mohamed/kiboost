import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  Filter, 
  Heart,
  Leaf,
  Brain,
  Zap,
  Shield,
  Apple,
  Dumbbell
} from "lucide-react";
import { RecipeFilters } from "../types";

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

const healthBenefits = [
  { category: 'cognitive', icon: <Brain className="w-4 h-4" />, label: 'Développement cognitif' },
  { category: 'energy', icon: <Zap className="w-4 h-4" />, label: 'Énergie' },
  { category: 'immunity', icon: <Shield className="w-4 h-4" />, label: 'Immunité' },
  { category: 'growth', icon: <Apple className="w-4 h-4" />, label: 'Croissance' },
  { category: 'physical', icon: <Dumbbell className="w-4 h-4" />, label: 'Développement physique' },
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bienfaits santé */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Bienfaits santé recherchés
          </Label>
          <div className="flex flex-wrap gap-2">
            {healthBenefits.map((benefit) => (
              <Badge
                key={benefit.category}
                variant={filters.healthBenefits?.includes(benefit.category) ? "default" : "outline"}
                className="cursor-pointer flex items-center gap-1"
                onClick={() => {
                  const current = filters.healthBenefits || [];
                  const updated = current.includes(benefit.category)
                    ? current.filter(b => b !== benefit.category)
                    : [...current, benefit.category];
                  handleFilterChange('healthBenefits', updated);
                }}
              >
                {benefit.icon}
                {benefit.label}
              </Badge>
            ))}
          </div>
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
            <Shield className="w-4 h-4" />
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
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <Badge
                key={month}
                variant={filters.season === month ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleFilterChange('season', month)}
              >
                {new Date(2024, month - 1).toLocaleString('fr-FR', { month: 'long' })}
              </Badge>
            ))}
          </div>
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