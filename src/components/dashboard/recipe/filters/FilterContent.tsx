import { Button } from "@/components/ui/button";
import { Filter, Brain, DollarSign, Calendar } from "lucide-react";
import { RecipeFilters } from "../../types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { Label } from "@/components/ui/label";

interface FilterContentProps {
  filters: RecipeFilters;
  onFiltersChange: (filters: RecipeFilters) => void;
}

const healthBenefits = [
  { category: 'cognitive', label: 'Développement cognitif' },
  { category: 'energy', label: 'Énergie' },
  { category: 'immunity', label: 'Immunité' },
  { category: 'growth', label: 'Croissance' },
  { category: 'physical', label: 'Développement physique' },
];

const months = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export const FilterContent = ({ filters, onFiltersChange }: FilterContentProps) => {
  const isMobile = useIsMobile();
  
  const handleFilterChange = (key: keyof RecipeFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const content = (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Filtres avancés</h3>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" />
            Bienfaits santé recherchés
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {healthBenefits.map((benefit) => (
              <Button
                key={benefit.category}
                variant={filters.healthBenefits?.includes(benefit.category) ? "default" : "outline"}
                onClick={() => {
                  const currentBenefits = filters.healthBenefits || [];
                  const newBenefits = currentBenefits.includes(benefit.category)
                    ? currentBenefits.filter(b => b !== benefit.category)
                    : [...currentBenefits, benefit.category];
                  handleFilterChange('healthBenefits', newBenefits);
                }}
                className="w-full justify-start gap-2"
              >
                <Brain className="w-4 h-4" />
                {benefit.label}
              </Button>
            ))}
          </div>
        </div>

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

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Saisonnalité
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {months.map((month, index) => (
              <Button
                key={month}
                variant={filters.season === index + 1 ? "default" : "outline"}
                onClick={() => handleFilterChange('season', index + 1)}
                className="w-full justify-start gap-2"
              >
                <Calendar className="w-4 h-4" />
                {month}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button
          variant="outline"
          onClick={() => onFiltersChange({})}
          className="w-full md:w-auto"
        >
          Réinitialiser les filtres
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <ScrollArea className="h-[calc(100vh-10rem)]">
        {content}
      </ScrollArea>
    );
  }

  return content;
};