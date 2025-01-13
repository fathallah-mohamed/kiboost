import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2, ChefHat, Plus } from 'lucide-react';
import { RecipeCard } from "./recipe/RecipeCard";
import { useRecipeGeneration } from "./recipe/useRecipeGeneration";
import { ChildProfile, MealType, Difficulty, Recipe } from "./types";
import { ChildSelector } from "./recipe/ChildSelector";
import { RecipeFilters } from "./recipe/RecipeFilters";
import { useState, useEffect } from "react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";

export const RecipeGenerator = () => {
  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(null);
  const [mealType, setMealType] = useState<MealType | "all">("breakfast");
  const [maxPrepTime, setMaxPrepTime] = useState(10);
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("easy");
  const [plannedRecipes, setPlannedRecipes] = useState<string[]>([]);
  const { toast } = useToast();
  
  const { loading, recipes, error, generateRecipes } = useRecipeGeneration();

  useEffect(() => {
    fetchPlannedRecipes();
    autoSelectChild();
  }, []);

  const fetchPlannedRecipes = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('meal_plans')
        .select('recipe_id')
        .eq('profile_id', session.user.id);

      if (error) throw error;
      setPlannedRecipes(data.map(plan => plan.recipe_id));
    } catch (error) {
      console.error('Error fetching planned recipes:', error);
    }
  };

  const autoSelectChild = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('children_profiles')
        .select('*')
        .eq('profile_id', session.user.id);

      if (error) throw error;

      if (data && data.length === 1) {
        setSelectedChild(data[0]);
      }
    } catch (error) {
      console.error('Error fetching children:', error);
    }
  };

  const handleGenerateRecipes = async () => {
    if (!selectedChild) return;
    await generateRecipes(selectedChild, {
      mealType: mealType === "all" ? undefined : mealType,
      maxPrepTime,
      difficulty: difficulty === "all" ? undefined : difficulty,
    });
  };

  const saveRecipe = async (recipe: Recipe) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Non authentifié");

      const { error } = await supabase
        .from('recipes')
        .insert([{
          ...recipe,
          profile_id: session.user.id,
        }]);

      if (error) throw error;

      toast({
        title: "Recette sauvegardée",
        description: "La recette a été ajoutée à votre planificateur",
      });

      // Mettre à jour la liste des recettes planifiées
      await fetchPlannedRecipes();
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de sauvegarder la recette.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold">Générateur de recettes</h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
          <div className="w-full sm:w-64">
            <ChildSelector 
              onSelectChild={setSelectedChild}
              selectedChild={selectedChild}
            />
          </div>
          <Button 
            onClick={handleGenerateRecipes} 
            disabled={loading || !selectedChild}
            className="whitespace-nowrap"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <ChefHat className="w-4 h-4 mr-2" />
            )}
            Générer des recettes
          </Button>
        </div>
      </div>

      <RecipeFilters
        mealType={mealType}
        setMealType={setMealType}
        maxPrepTime={maxPrepTime}
        setMaxPrepTime={setMaxPrepTime}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
      />

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recipes.map((recipe, index) => (
          <div key={index} className="relative">
            <RecipeCard recipe={recipe} />
            <Button
              className="absolute top-4 right-4"
              onClick={() => saveRecipe(recipe)}
              disabled={plannedRecipes.includes(recipe.id)}
            >
              <Plus className="w-4 h-4 mr-2" />
              {plannedRecipes.includes(recipe.id) ? 'Déjà planifiée' : 'Planifier'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};