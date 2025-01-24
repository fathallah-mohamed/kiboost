import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChefHat, Filter } from 'lucide-react';
import { BackToDashboard } from './BackToDashboard';
import { useNavigate } from 'react-router-dom';
import { MultiChildSelector } from './recipe/MultiChildSelector';
import { ChildProfile, RecipeFilters } from './types';
import { RecipeFilters as BasicRecipeFilters } from './recipe/RecipeFilters';
import { AdvancedFilters } from './recipe/AdvancedFilters';

interface RecipeGeneratorProps {
  onSectionChange: (section: string) => void;
}

export const RecipeGenerator = ({ onSectionChange }: RecipeGeneratorProps) => {
  const navigate = useNavigate();
  const [selectedChildren, setSelectedChildren] = useState<ChildProfile[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [mealType, setMealType] = useState<'all' | 'breakfast' | 'lunch' | 'dinner' | 'snack'>('all');
  const [maxPrepTime, setMaxPrepTime] = useState(60);
  const [difficulty, setDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [advancedFilters, setAdvancedFilters] = useState<RecipeFilters>({});

  const handleGenerateRecipes = () => {
    navigate('/dashboard/recipes');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <BackToDashboard onBack={() => onSectionChange('categories')} />

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold">
              Générateur de Recettes
            </h2>
            <p className="text-muted-foreground mt-2">
              Générez des recettes personnalisées adaptées à vos besoins
            </p>
          </div>

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
              <h3 className="text-lg font-semibold mb-4">Filtres de base</h3>
              <BasicRecipeFilters
                mealType={mealType}
                setMealType={setMealType}
                maxPrepTime={maxPrepTime}
                setMaxPrepTime={setMaxPrepTime}
                difficulty={difficulty}
                setDifficulty={setDifficulty}
              />
            </Card>

            <Button
              variant="outline"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="w-full flex items-center justify-center gap-2"
            >
              <Filter className="w-4 h-4" />
              {showAdvancedFilters ? "Masquer" : "Afficher"} les filtres avancés
            </Button>

            <AdvancedFilters
              filters={advancedFilters}
              onFiltersChange={setAdvancedFilters}
              open={showAdvancedFilters}
              onOpenChange={setShowAdvancedFilters}
            />

            <Button 
              onClick={handleGenerateRecipes}
              className="w-full"
              size="lg"
            >
              <ChefHat className="w-5 h-5 mr-2" />
              Générer des recettes
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};