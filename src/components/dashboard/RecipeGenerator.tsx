import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChefHat, Filter } from 'lucide-react';
import { BackToDashboard } from './BackToDashboard';
import { toast } from 'sonner';
import { useRecipeGeneration } from './recipe/useRecipeGeneration';
import { useSession } from '@supabase/auth-helpers-react';
import { useNavigate } from 'react-router-dom';
import { MultiChildSelector } from './recipe/MultiChildSelector';
import { RecipeFiltersSection } from './recipe/RecipeFiltersSection';
import { ChildProfile, MealType, Difficulty, RecipeFilters } from './types';

interface RecipeGeneratorProps {
  onSectionChange: (section: string) => void;
}

export const RecipeGenerator = ({ onSectionChange }: RecipeGeneratorProps) => {
  const session = useSession();
  const navigate = useNavigate();
  const { generateRecipes, loading, error } = useRecipeGeneration();
  const [selectedChildren, setSelectedChildren] = useState<ChildProfile[]>([]);
  
  // Basic filters state
  const [mealType, setMealType] = useState<MealType | "all">("all");
  const [maxPrepTime, setMaxPrepTime] = useState(60);
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  
  // Advanced filters state
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<RecipeFilters>({});

  const handleGenerateRecipes = async () => {
    if (selectedChildren.length === 0) {
      toast.error("Veuillez sélectionner au moins un enfant");
      return;
    }

    try {
      await generateRecipes();
      navigate('/dashboard/recipes');
    } catch (err) {
      toast.error("Une erreur est survenue lors de la génération des recettes");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <BackToDashboard onBack={() => onSectionChange('categories')} />

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">
          Générateur de Recettes
        </h2>
        <p className="text-muted-foreground mb-6">
          Générez des recettes personnalisées adaptées à vos besoins
        </p>

        <div className="space-y-6">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Sélection des enfants</h3>
            <MultiChildSelector
              selectedChildren={selectedChildren}
              onSelectChildren={setSelectedChildren}
              mode="compact"
            />
          </Card>

          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Filtres</h3>
            <RecipeFiltersSection
              mealType={mealType}
              setMealType={setMealType}
              maxPrepTime={maxPrepTime}
              setMaxPrepTime={setMaxPrepTime}
              difficulty={difficulty}
              setDifficulty={setDifficulty}
              showAdvancedFilters={showAdvancedFilters}
              setShowAdvancedFilters={setShowAdvancedFilters}
              advancedFilters={advancedFilters}
              setAdvancedFilters={setAdvancedFilters}
            />
          </Card>

          <Button 
            onClick={handleGenerateRecipes} 
            className="w-full"
            disabled={loading || selectedChildren.length === 0}
          >
            <ChefHat className="w-4 h-4 mr-2" />
            Générer des recettes
          </Button>
        </div>
      </Card>
    </div>
  );
};