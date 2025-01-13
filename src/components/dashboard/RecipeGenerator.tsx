import { useState, useEffect } from "react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";
import { ChildProfile, Recipe, MealType, Difficulty } from "./types";
import { RecipeFilters } from "./recipe/RecipeFilters";
import { RecipeGeneratorHeader } from "./recipe/RecipeGeneratorHeader";
import { RecipeList } from "./recipe/RecipeList";
import { useRecipeGeneration } from "./recipe/useRecipeGeneration";

export const RecipeGenerator = () => {
  const [selectedChildren, setSelectedChildren] = useState<ChildProfile[]>([]);
  const [mealType, setMealType] = useState<MealType | "all">("breakfast");
  const [maxPrepTime, setMaxPrepTime] = useState(10);
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("easy");
  const [plannedRecipes, setPlannedRecipes] = useState<string[]>([]);
  const { toast } = useToast();
  
  const { loading, recipes, error, generateRecipes } = useRecipeGeneration();

  useEffect(() => {
    fetchPlannedRecipes();
  }, [selectedChildren]);

  const fetchPlannedRecipes = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const query = supabase
        .from('meal_plans')
        .select('recipe_id')
        .eq('profile_id', session.user.id);

      if (selectedChildren.length > 0) {
        query.in('child_id', selectedChildren.map(child => child.id));
      }

      const { data, error } = await query;

      if (error) throw error;
      setPlannedRecipes(data.map(plan => plan.recipe_id));
    } catch (error) {
      console.error('Error fetching planned recipes:', error);
    }
  };

  const handleGenerateRecipes = async () => {
    if (selectedChildren.length === 0) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez sélectionner au moins un enfant.",
      });
      return;
    }

    await generateRecipes(selectedChildren[0], {
      mealType: mealType === "all" ? undefined : mealType,
      maxPrepTime,
      difficulty: difficulty === "all" ? undefined : difficulty,
    });
  };

  const saveRecipe = async (recipe: Recipe) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Non authentifié");

      // Format the recipe data according to the database schema
      const recipeData = {
        profile_id: session.user.id,
        name: recipe.name,
        ingredients: JSON.stringify(recipe.ingredients),
        instructions: recipe.instructions.join('\n'),
        nutritional_info: JSON.stringify(recipe.nutritional_info),
        meal_type: recipe.meal_type,
        preparation_time: recipe.preparation_time,
        difficulty: recipe.difficulty,
        servings: recipe.servings,
      };

      const { data: savedRecipe, error: recipeError } = await supabase
        .from('recipes')
        .insert([recipeData])
        .select()
        .single();

      if (recipeError) throw recipeError;

      // Save to meal plan for each selected child
      const mealPlans = selectedChildren.map(child => ({
        profile_id: session.user.id,
        recipe_id: savedRecipe.id,
        child_id: child.id,
        date: new Date().toISOString().split('T')[0],
      }));

      const { error: planError } = await supabase
        .from('meal_plans')
        .insert(mealPlans);

      if (planError) throw planError;

      toast({
        title: "Recette sauvegardée",
        description: `La recette a été ajoutée au planificateur pour ${selectedChildren.length} enfant(s)`,
      });

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
      <RecipeGeneratorHeader
        loading={loading}
        selectedChildren={selectedChildren}
        onSelectChildren={setSelectedChildren}
        onGenerateRecipes={handleGenerateRecipes}
      />

      <RecipeFilters
        mealType={mealType}
        setMealType={setMealType}
        maxPrepTime={maxPrepTime}
        setMaxPrepTime={setMaxPrepTime}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
      />

      <RecipeList
        recipes={recipes}
        error={error}
        plannedRecipes={plannedRecipes}
        onSaveRecipe={saveRecipe}
      />
    </div>
  );
};