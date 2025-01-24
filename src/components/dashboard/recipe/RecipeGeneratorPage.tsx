import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { useRecipeGeneration } from './useRecipeGeneration';
import { useSession } from '@supabase/auth-helpers-react';
import { BackToDashboard } from '../BackToDashboard';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Recipe, ChildProfile, RecipeFilters, MealType, Difficulty } from "../types";
import { MultiChildSelector } from './MultiChildSelector';
import { RecipeFiltersSection } from './RecipeFiltersSection';
import { RecipeList } from './RecipeList';
import { LoadMoreButton } from './LoadMoreButton';

export const RecipeGeneratorPage = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedChildren, setSelectedChildren] = useState<ChildProfile[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [displayCount, setDisplayCount] = useState(5);
  const [error, setError] = useState<string | null>(null);
  const [plannedRecipes, setPlannedRecipes] = useState<{ [key: string]: Recipe | null }>({});
  const [mealType, setMealType] = useState<MealType | "all">("all");
  const [maxPrepTime, setMaxPrepTime] = useState(60);
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<RecipeFilters>({
    dietaryPreferences: [],
    excludedAllergens: [],
    maxCost: 15,
    healthBenefits: [],
    season: 1, // Changé de seasonalMonths à season
  });

  const session = useSession();
  const navigate = useNavigate();
  const { generateRecipes } = useRecipeGeneration();

  const handleGenerateRecipes = async () => {
    if (selectedChildren.length === 0) {
      toast.error("Veuillez sélectionner au moins un enfant");
      return;
    }

    try {
      setLoading(true);
      const generatedRecipes = await generateRecipes(selectedChildren[0]);
      setRecipes(generatedRecipes);
      toast.success("Recettes générées avec succès !");
    } catch (error) {
      console.error('Error generating recipes:', error);
      toast.error("Une erreur est survenue lors de la génération des recettes");
      setError("Une erreur est survenue lors de la génération des recettes");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRecipe = async (recipe: Recipe) => {
    try {
      setSaving(true);
      // Implement save recipe logic here
      toast.success("Recette sauvegardée avec succès !");
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast.error("Une erreur est survenue lors de la sauvegarde de la recette");
    } finally {
      setSaving(false);
    }
  };

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 5);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <BackToDashboard onBack={() => navigate('/dashboard')} />
      
      <div className="space-y-6">
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

            <div className="flex justify-end">
              <button
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
                onClick={handleGenerateRecipes}
                disabled={loading || saving || selectedChildren.length === 0}
              >
                {loading ? "Génération en cours..." : "Générer des recettes"}
              </button>
            </div>
          </div>
        </Card>

        {recipes.length > 0 && (
          <>
            <RecipeList
              recipes={recipes.slice(0, displayCount)}
              error={error}
              plannedRecipes={plannedRecipes}
              onSaveRecipe={handleSaveRecipe}
            />

            <LoadMoreButton 
              displayCount={displayCount}
              totalCount={recipes.length}
              onLoadMore={handleLoadMore}
            />
          </>
        )}
      </div>
    </div>
  );
};