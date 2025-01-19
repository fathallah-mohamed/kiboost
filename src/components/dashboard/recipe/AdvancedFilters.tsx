import { Card } from "@/components/ui/card";
import { RecipeFilters } from "../types";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { FilterContent } from "./filters/FilterContent";

interface AdvancedFiltersProps {
  filters: RecipeFilters;
  onFiltersChange: (filters: RecipeFilters) => void;
}

export const AdvancedFilters = ({ filters, onFiltersChange }: AdvancedFiltersProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Sheet>
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