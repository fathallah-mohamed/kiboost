import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { RecipeFilters, SpecialOccasion } from "../../types";
import { HealthBenefitsFilter } from "./HealthBenefitsFilter";
import { BudgetFilter } from "./BudgetFilter";
import { SeasonalityFilter } from "./SeasonalityFilter";
import { IngredientsFilter } from "./IngredientsFilter";
import { SpecialOccasionsFilter } from "./SpecialOccasionsFilter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="ingredients">
          <AccordionTrigger>Ingrédients</AccordionTrigger>
          <AccordionContent>
            <IngredientsFilter
              includedIngredients={filters.includedIngredients || []}
              excludedIngredients={filters.excludedIngredients || []}
              onIncludedChange={(ingredients) => handleFilterChange('includedIngredients', ingredients)}
              onExcludedChange={(ingredients) => handleFilterChange('excludedIngredients', ingredients)}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="health">
          <AccordionTrigger>Bienfaits santé</AccordionTrigger>
          <AccordionContent>
            <HealthBenefitsFilter
              selectedBenefits={filters.healthBenefits || []}
              onBenefitsChange={(benefits) => handleFilterChange('healthBenefits', benefits)}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="budget">
          <AccordionTrigger>Budget</AccordionTrigger>
          <AccordionContent>
            <BudgetFilter
              maxCost={filters.maxCost || 15}
              onMaxCostChange={(cost) => handleFilterChange('maxCost', cost)}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="seasonality">
          <AccordionTrigger>Saisonnalité</AccordionTrigger>
          <AccordionContent>
            <SeasonalityFilter
              selectedMonth={filters.season}
              onMonthChange={(month) => handleFilterChange('season', month)}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="occasions">
          <AccordionTrigger>Occasions spéciales</AccordionTrigger>
          <AccordionContent>
            <SpecialOccasionsFilter
              selectedOccasion={filters.specialOccasion}
              onOccasionChange={(occasion) => handleFilterChange('specialOccasion', occasion)}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

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