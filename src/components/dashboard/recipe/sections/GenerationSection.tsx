import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MultiChildSelector } from "../MultiChildSelector";
import { RecipeFiltersSection } from "../RecipeFiltersSection";
import { ChildProfile } from "../../types";
import { toast } from "sonner";
import { useRecipeFilters } from "../hooks/useRecipeFilters";

interface GenerationSectionProps {
  loading: boolean;
  saving: boolean;
  selectedChildren: ChildProfile[];
  setSelectedChildren: (children: ChildProfile[]) => void;
  onGenerate: () => Promise<void>;
  filters: ReturnType<typeof useRecipeFilters>;
}

export const GenerationSection = ({
  loading,
  saving,
  selectedChildren,
  setSelectedChildren,
  onGenerate,
  filters,
}: GenerationSectionProps) => {
  const handleGenerate = async () => {
    if (selectedChildren.length === 0) {
      toast.error("Veuillez sélectionner au moins un enfant");
      return;
    }
    await onGenerate();
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Générateur de Recettes</h2>
          <p className="text-muted-foreground mt-2">
            Générez des recettes personnalisées adaptées aux besoins de vos enfants
          </p>
        </div>

        <MultiChildSelector 
          onSelectChildren={setSelectedChildren}
          selectedChildren={selectedChildren}
          mode="compact"
        />

        <RecipeFiltersSection
          mealType={filters.mealType}
          setMealType={filters.setMealType}
          maxPrepTime={filters.maxPrepTime}
          setMaxPrepTime={filters.setMaxPrepTime}
          difficulty={filters.difficulty}
          setDifficulty={filters.setDifficulty}
          showAdvancedFilters={filters.showAdvancedFilters}
          setShowAdvancedFilters={filters.setShowAdvancedFilters}
          advancedFilters={filters.advancedFilters}
          setAdvancedFilters={filters.setAdvancedFilters}
        />

        <div className="flex justify-end">
          <Button
            onClick={handleGenerate}
            disabled={loading || saving || selectedChildren.length === 0}
          >
            {loading ? "Génération en cours..." : "Générer des recettes"}
          </Button>
        </div>
      </div>
    </Card>
  );
};