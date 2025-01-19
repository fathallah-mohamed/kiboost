import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Filter } from "lucide-react";
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
        <SheetTrigger asChild>
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full flex items-center gap-2 text-lg font-medium hover:bg-secondary/50 transition-colors"
          >
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