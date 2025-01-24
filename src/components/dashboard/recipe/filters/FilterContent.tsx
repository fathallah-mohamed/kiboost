import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { RecipeFilters } from "../../types";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";

interface FilterContentProps {
  filters: RecipeFilters;
  onFiltersChange: (filters: RecipeFilters) => void;
}

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
      </Accordion>

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