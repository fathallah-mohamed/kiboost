import { useState } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { BackToDashboard } from '../BackToDashboard';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Recipe, ChildProfile } from "../types";
import { StepNavigation } from '../navigation/StepNavigation';
import { useRecipeFilters } from './hooks/useRecipeFilters';
import { useInView } from 'react-intersection-observer';
import { LoadingOverlay } from './LoadingOverlay';
import { GenerationSection } from './sections/GenerationSection';
import { ResultsSection } from './sections/ResultsSection';
import { useRecipeQuery } from './hooks/useRecipeQuery';
import { useRecipeGeneration } from './hooks/useRecipeGeneration';
import { useRecipeSaving } from './hooks/useRecipeSaving';

export const RecipeGeneratorPage = () => {
  const [loading, setLoading] = useState(false);
  const [selectedChildren, setSelectedChildren] = useState<ChildProfile[]>([]);
  const [displayCount, setDisplayCount] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const session = useSession();
  const navigate = useNavigate();
  const filters = useRecipeFilters();
  const { ref: loadMoreRef, inView } = useInView();
  const { generateRecipes } = useRecipeGeneration();
  const { saveRecipe } = useRecipeSaving();

  // Fetch existing generated recipes
  const { data: recipes = [] } = useRecipeQuery(session?.user?.id, filters.getFilters());

  const handleGenerateRecipes = async () => {
    if (!selectedChildren.length) {
      toast.error("Veuillez sélectionner au moins un enfant");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const selectedChild = selectedChildren[0];
      
      if (!selectedChild.name || !selectedChild.birth_date) {
        throw new Error("Les informations de l'enfant sont incomplètes");
      }

      console.log("Generating recipes with filters:", filters.getFilters());
      const newRecipes = await generateRecipes(selectedChild, filters.getFilters());
      console.log("Generated recipes:", newRecipes);
      
      if (!newRecipes || newRecipes.length === 0) {
        throw new Error("Aucune recette n'a été générée");
      }
      
    } catch (error) {
      console.error('Error generating recipes:', error);
      const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    setDisplayCount(prev => Math.min(prev + 5, recipes.length));
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {loading && <LoadingOverlay />}
      
      <BackToDashboard onBack={() => navigate('/dashboard')} />
      
      <div className="space-y-6">
        <GenerationSection
          loading={loading}
          saving={false}
          selectedChildren={selectedChildren}
          setSelectedChildren={setSelectedChildren}
          onGenerate={handleGenerateRecipes}
          filters={filters}
        />

        <ResultsSection
          recipes={recipes.slice(0, displayCount)}
          displayCount={displayCount}
          error={error}
          onSaveRecipe={saveRecipe}
          onLoadMore={handleLoadMore}
        />

        {displayCount < recipes.length && (
          <div ref={loadMoreRef} className="h-10" />
        )}

        <StepNavigation
          previousStep={{
            label: "Profils enfants",
            route: "/dashboard/children"
          }}
          nextStep={{
            label: "Planifier les repas",
            route: "/dashboard/planner"
          }}
        />
      </div>
    </div>
  );
};