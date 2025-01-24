import { Card } from "@/components/ui/card";
import { RecipeFilters } from "../types";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { FilterContent } from "./filters/FilterContent";

interface AdvancedFiltersProps {
  filters: RecipeFilters;
  onFiltersChange: (filters: RecipeFilters) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AdvancedFilters = ({ 
  filters, 
  onFiltersChange, 
  open, 
  onOpenChange 
}: AdvancedFiltersProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[80vh]">
          <SheetHeader>
            <SheetTitle>Filtres avancés</SheetTitle>
          </SheetHeader>
          <FilterContent filters={filters} onFiltersChange={onFiltersChange} />
        </SheetContent>
      </Sheet>
    );
  }

  if (!open) {
    return null;
  }

  return (
    <Card className="p-6 mt-4">
      <FilterContent filters={filters} onFiltersChange={onFiltersChange} />
    </Card>
  );
};