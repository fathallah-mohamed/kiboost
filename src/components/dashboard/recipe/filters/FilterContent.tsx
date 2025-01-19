import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { RecipeFilters } from "../../types";
import { HealthBenefitsFilter } from "./HealthBenefitsFilter";
import { BudgetFilter } from "./BudgetFilter";
import { SeasonalityFilter } from "./SeasonalityFilter";

interface FilterContentProps {
  filters: RecipeFilters;
  onFiltersChange: (filters: RecipeFilters) => void;
}

export const FilterContent = ({ filters, onFiltersChange }: FilterContentProps) => {
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
        <HealthBenefitsFilter
          selectedBenefits={filters.healthBenefits || []}
          onBenefitsChange={(benefits) => handleFilterChange('healthBenefits', benefits)}
        />

        <BudgetFilter
          maxCost={filters.maxCost || 15}
          onMaxCostChange={(cost) => handleFilterChange('maxCost', cost)}
        />

        <SeasonalityFilter
          selectedMonth={filters.season}
          onMonthChange={(month) => handleFilterChange('season', month)}
        />
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