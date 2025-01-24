import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRecipeGeneration } from './useRecipeGeneration';
import { useSession } from '@supabase/auth-helpers-react';
import { BackToDashboard } from '../BackToDashboard';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MultiChildSelector } from './MultiChildSelector';
import { RecipeFiltersSection } from './RecipeFiltersSection';
import { ChildProfile, MealType, Difficulty, RecipeFilters } from '../types';
import { toast } from 'sonner';

export const RecipeGeneratorPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedChildren, setSelectedChildren] = useState<ChildProfile[]>([]);
  const [mealType, setMealType] = useState<MealType | "all">("all");
  const [maxPrepTime, setMaxPrepTime] = useState(60);
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<RecipeFilters>({});

  const session = useSession();
  const navigate = useNavigate();
  const { generateRecipes, loading } = useRecipeGeneration();

  const handleGenerateRecipes = async () => {
    if (selectedChildren.length === 0) {
      toast.error("Veuillez sélectionner au moins un enfant");
      return;
    }

    try {
      await generateRecipes(selectedChildren[0]); // For now, using first child
      navigate('/dashboard/recipes');
    } catch (error) {
      console.error('Error generating recipes:', error);
      toast.error("Une erreur est survenue lors de la génération des recettes");
    }
  };

  const goToNextStep = () => {
    if (currentStep === 1 && selectedChildren.length === 0) {
      toast.error("Veuillez sélectionner au moins un enfant");
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const goToPreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Sélection des enfants</h3>
            <MultiChildSelector
              selectedChildren={selectedChildren}
              onSelectChildren={setSelectedChildren}
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Filtres de base</h3>
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
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Confirmation</h3>
            <div className="space-y-4">
              <p>Enfants sélectionnés : {selectedChildren.map(child => child.name).join(', ')}</p>
              <p>Type de repas : {mealType}</p>
              <p>Temps de préparation maximum : {maxPrepTime} minutes</p>
              <p>Difficulté : {difficulty}</p>
            </div>
            <Button 
              onClick={handleGenerateRecipes}
              disabled={loading || selectedChildren.length === 0}
              className="w-full"
            >
              Générer les recettes
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <BackToDashboard onBack={() => navigate('/dashboard')} />
      
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Générateur de Recettes</h2>
            <p className="text-muted-foreground mt-2">
              Étape {currentStep} sur 3
            </p>
          </div>

          <div className="space-y-6">
            {renderStepContent()}
          </div>

          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={goToPreviousStep}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Précédent
            </Button>
            {currentStep < 3 && (
              <Button onClick={goToNextStep}>
                Suivant
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};