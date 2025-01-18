import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { 
  DollarSign, 
  Filter, 
  Heart,
  Leaf,
  Brain,
  Zap,
  Shield,
  Apple,
  Dumbbell,
  Calendar
} from "lucide-react";
import { RecipeFilters } from "../types";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface AdvancedFiltersProps {
  filters: RecipeFilters;
  onFiltersChange: (filters: RecipeFilters) => void;
}

const healthBenefits = [
  { category: 'cognitive', icon: <Brain className="w-4 h-4" />, label: 'Développement cognitif' },
  { category: 'energy', icon: <Zap className="w-4 h-4" />, label: 'Énergie' },
  { category: 'immunity', icon: <Shield className="w-4 h-4" />, label: 'Immunité' },
  { category: 'growth', icon: <Apple className="w-4 h-4" />, label: 'Croissance' },
  { category: 'physical', icon: <Dumbbell className="w-4 h-4" />, label: 'Développement physique' },
];

const FilterContent = ({ filters, onFiltersChange }: AdvancedFiltersProps) => {
  const handleFilterChange = (key: keyof RecipeFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Filtres avancés</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bienfaits santé */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-primary" />
            Bienfaits santé recherchés
          </Label>
          <div className="flex flex-wrap gap-2">
            {healthBenefits.map((benefit) => (
              <Badge
                key={benefit.category}
                variant={filters.healthBenefits?.includes(benefit.category) ? "default" : "outline"}
                className={cn(
                  "cursor-pointer flex items-center gap-1 transition-all",
                  filters.healthBenefits?.includes(benefit.category) 
                    ? "bg-primary hover:bg-primary/90" 
                    : "hover:bg-secondary/50"
                )}
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

        {/* Budget */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" />
            Budget maximum par portion: {filters.maxCost || 15}€
          </Label>
          <input
            type="range"
            min={5}
            max={30}
            step={1}
            value={filters.maxCost || 15}
            onChange={(e) => handleFilterChange('maxCost', Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>

        {/* Saisonnalité */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Saisonnalité
          </Label>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <Badge
                key={month}
                variant={filters.season === month ? "default" : "outline"}
                className={cn(
                  "cursor-pointer transition-all",
                  filters.season === month 
                    ? "bg-primary hover:bg-primary/90" 
                    : "hover:bg-secondary/50"
                )}
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
    </div>
  );
};

export const AdvancedFilters = ({ filters, onFiltersChange }: AdvancedFiltersProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="lg" className="w-full flex items-center gap-2">
            <Filter className="w-6 h-6" />
            Filtres avancés
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh]">
          <FilterContent filters={filters} onFiltersChange={onFiltersChange} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Card className="p-6">
      <FilterContent filters={filters} onFiltersChange={onFiltersChange} />
    </Card>
  );
};