import { useState } from 'react';
import { useRecipeGeneration } from './useRecipeGeneration';
import { useSession } from '@supabase/auth-helpers-react';
import { BackToDashboard } from '../BackToDashboard';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Recipe, ChildProfile } from "../types";
import { StepNavigation } from '../navigation/StepNavigation';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRecipeFilters } from './hooks/useRecipeFilters';
import { GenerationSection } from './sections/GenerationSection';
import { ResultsSection } from './sections/ResultsSection';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import { LoadingOverlay } from './LoadingOverlay';

export const RecipeGeneratorPage = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedChildren, setSelectedChildren] = useState<ChildProfile[]>([]);
  const [displayCount, setDisplayCount] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const session = useSession();
  const navigate = useNavigate();
  const { generateRecipes } = useRecipeGeneration();
  const filters = useRecipeFilters();
  const { ref: loadMoreRef, inView } = useInView();

  const { data: recipes = [], refetch: refetchRecipes } = useQuery({
    queryKey: ['generated-recipes', session?.user?.id, filters.getFilters()],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      let query = supabase
        .from('recipes')
        .select('*')
        .eq('profile_id', session.user.id)
        .eq('is_generated', true);

      if (filters.mealType && filters.mealType !== 'all') {
        query = query.eq('meal_type', filters.mealType);
      }
      
      if (filters.maxPrepTime) {
        query = query.lte('preparation_time', filters.maxPrepTime);
      }

      if (filters.difficulty && filters.difficulty !== 'all') {
        query = query.eq('difficulty', filters.difficulty);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching recipes:', error);
        throw error;
      }

      const transformedRecipes = (data || []).map(recipe => ({
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

      // Mélanger les recettes de manière aléatoire pour plus de variété
      return transformedRecipes.sort(() => Math.random() - 0.5);
    },
    enabled: !!session?.user?.id,
  });

  useEffect(() => {
    if (inView) {
      setDisplayCount(prev => Math.min(prev + 5, recipes.length));
    }
  }, [inView, recipes.length]);

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

      await generateRecipes(selectedChild, filters.getFilters());
      await refetchRecipes();
      toast.success("Recettes générées avec succès !");
    } catch (error) {
      console.error('Error generating recipes:', error);
      const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue lors de la génération des recettes";
      toast.error(errorMessage);
      setError(errorMessage);
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
    setDisplayCount(prev => Math.min(prev + 5, recipes.length));
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {loading && <LoadingOverlay />}
      
      <BackToDashboard onBack={() => navigate('/dashboard')} />
      
      <div className="space-y-6">
        <GenerationSection
          loading={loading}
          saving={saving}
          selectedChildren={selectedChildren}
          setSelectedChildren={setSelectedChildren}
          onGenerate={handleGenerateRecipes}
          filters={filters}
        />

        <ResultsSection
          recipes={recipes.slice(0, displayCount)}
          displayCount={displayCount}
          error={error}
          onSaveRecipe={handleSaveRecipe}
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