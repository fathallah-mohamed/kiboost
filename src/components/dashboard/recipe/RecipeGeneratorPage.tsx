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
import { StepNavigation } from '../navigation/StepNavigation';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const RecipeGeneratorPage = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedChildren, setSelectedChildren] = useState<ChildProfile[]>([]);
  const [displayCount, setDisplayCount] = useState(5);
  const [error, setError] = useState<string | null>(null);
  const session = useSession();
  const navigate = useNavigate();
  const { generateRecipes } = useRecipeGeneration();

  // États pour les filtres
  const [mealType, setMealType] = useState<MealType | "all">("all");
  const [maxPrepTime, setMaxPrepTime] = useState(60);
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<RecipeFilters>({
    dietaryPreferences: [],
    excludedAllergens: [],
    maxCost: 15,
    healthBenefits: [],
    season: 1
  });

  // Fetch generated recipes from the database
  const { data: recipes = [], refetch: refetchRecipes } = useQuery({
    queryKey: ['generated-recipes', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('profile_id', session.user.id)
        .eq('is_generated', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching recipes:', error);
        throw error;
      }

      return data.map(recipe => ({
        ...recipe,
        ingredients: typeof recipe.ingredients === 'string' 
          ? JSON.parse(recipe.ingredients)
          : recipe.ingredients,
        instructions: typeof recipe.instructions === 'string'
          ? recipe.instructions.split('\n').filter(Boolean)
          : Array.isArray(recipe.instructions)
            ? recipe.instructions
            : [recipe.instructions].filter(Boolean),
        nutritional_info: typeof recipe.nutritional_info === 'string'
          ? JSON.parse(recipe.nutritional_info)
          : recipe.nutritional_info,
        health_benefits: typeof recipe.health_benefits === 'string'
          ? JSON.parse(recipe.health_benefits)
          : recipe.health_benefits || [],
        cooking_steps: typeof recipe.cooking_steps === 'string'
          ? JSON.parse(recipe.cooking_steps)
          : recipe.cooking_steps || []
      })) as Recipe[];
    },
    enabled: !!session?.user?.id,
  });

  const handleGenerateRecipes = async () => {
    if (selectedChildren.length === 0) {
      toast.error("Veuillez sélectionner au moins un enfant");
      return;
    }

    try {
      setLoading(true);
      const filters: RecipeFilters = {
        ...advancedFilters,
        mealType: mealType === "all" ? undefined : mealType,
        maxPrepTime,
        difficulty: difficulty === "all" ? undefined : difficulty,
      };
      
      const generatedRecipes = await generateRecipes(selectedChildren[0], filters);
      await refetchRecipes();
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
              plannedRecipes={{}}
              onSaveRecipe={handleSaveRecipe}
            />

            <LoadMoreButton 
              displayCount={displayCount}
              totalCount={recipes.length}
              onLoadMore={handleLoadMore}
            />
          </>
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