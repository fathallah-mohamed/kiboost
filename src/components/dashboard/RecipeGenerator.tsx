import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ChefHat, Calendar, ShoppingCart, 
  Check, AlertCircle, Sparkles, ArrowRight, Circle
} from 'lucide-react';
import { BackToDashboard } from './BackToDashboard';
import { toast } from 'sonner';
import { ProgressSteps } from './sections/ProgressSteps';
import { useRecipeGeneration } from './recipe/hooks/useRecipeGeneration';
import { useRecipeSaving } from './recipe/hooks/useRecipeSaving';
import { usePlannedRecipesFetching } from './recipe/hooks/usePlannedRecipesFetching';
import { useSession } from '@supabase/auth-helpers-react';
import { useNavigate } from 'react-router-dom';
import { Recipe, ChildProfile } from './types';
import { RecipeGeneratorContent } from './recipe/RecipeGeneratorContent';

export const RecipeGenerator = () => {
  const [selectedChildren, setSelectedChildren] = useState<ChildProfile[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [displayCount, setDisplayCount] = useState(6);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const { generateRecipes, loading } = useRecipeGeneration();
  const { saveRecipe, saving } = useRecipeSaving();
  const { plannedRecipes } = usePlannedRecipesFetching();

  // Filter states
  const [mealType, setMealType] = useState<"all" | "breakfast" | "lunch" | "dinner" | "snack">("all");
  const [maxPrepTime, setMaxPrepTime] = useState(60);
  const [difficulty, setDifficulty] = useState<"all" | "easy" | "medium" | "hard">("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({});

  const handleGenerateRecipes = async () => {
    try {
      if (selectedChildren.length === 0) {
        setError("Veuillez sélectionner au moins un enfant");
        return;
      }

      const generatedRecipes = await generateRecipes(selectedChildren[0]);
      if (generatedRecipes) {
        setRecipes(generatedRecipes);
        setError(null);
      }
    } catch (err) {
      console.error('Error generating recipes:', err);
      setError("Une erreur est survenue lors de la génération des recettes");
    }
  };

  const handleSaveRecipe = async (recipe: Recipe) => {
    try {
      await saveRecipe(recipe, selectedChildren);
    } catch (err) {
      console.error('Error saving recipe:', err);
      setError("Une erreur est survenue lors de la sauvegarde de la recette");
    }
  };

  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + 6);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <BackToDashboard onBack={() => navigate('/dashboard')} />

      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Générateur de Recettes</h2>
            <p className="text-muted-foreground mt-2">
              Générez des recettes personnalisées adaptées à vos besoins
            </p>
          </div>

          <RecipeGeneratorContent
            loading={loading}
            saving={saving}
            selectedChildren={selectedChildren}
            setSelectedChildren={setSelectedChildren}
            recipes={recipes}
            displayCount={displayCount}
            error={error}
            plannedRecipes={plannedRecipes}
            handleGenerateRecipes={handleGenerateRecipes}
            handleSaveRecipe={handleSaveRecipe}
            handleLoadMore={handleLoadMore}
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
      </Card>
    </div>
  );
};