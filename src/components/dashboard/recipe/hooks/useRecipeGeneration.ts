import { useState } from "react";
import { Recipe, ChildProfile, RecipeFilters } from "../../types";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { toast } from "sonner";

export const useRecipeGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const session = useSession();

  const generateRecipes = async (child: ChildProfile, filters: RecipeFilters) => {
    if (!session?.user?.id) {
      toast.error("Vous devez être connecté pour générer des recettes");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log("Starting recipe generation for child:", child.name);

      const { data: response, error: generateError } = await supabase.functions.invoke(
        'generate-recipe',
        {
          body: { child, filters }
        }
      );

      if (generateError) {
        console.error("Error from generate-recipe function:", generateError);
        throw generateError;
      }

      if (!response.recipes || !Array.isArray(response.recipes)) {
        throw new Error("Format de réponse invalide");
      }

      console.log("Successfully generated recipes:", response.recipes);

      const savedRecipes: Recipe[] = [];
      const timestamp = new Date().toISOString();

      for (const recipe of response.recipes) {
        try {
          // Ensure ingredients are properly typed
          const typedIngredients = Array.isArray(recipe.ingredients) 
            ? recipe.ingredients.map(ing => ({
                item: String(ing.item || ''),
                quantity: String(ing.quantity || ''),
                unit: String(ing.unit || '')
              }))
            : [];

          // Ensure health_benefits are properly typed
          const typedHealthBenefits = Array.isArray(recipe.health_benefits)
            ? recipe.health_benefits.map(benefit => ({
                icon: String(benefit.icon || ''),
                category: benefit.category || 'global',
                description: String(benefit.description || '')
              }))
            : [];

          const typedRecipe: Partial<Recipe> = {
            ...recipe,
            ingredients: typedIngredients,
            health_benefits: typedHealthBenefits,
            profile_id: session.user.id,
            is_generated: true,
            created_at: timestamp,
            updated_at: timestamp,
            meal_type: recipe.meal_type || 'dinner',
            preparation_time: recipe.preparation_time || 30,
            difficulty: recipe.difficulty || 'medium',
            servings: recipe.servings || 4,
            min_age: recipe.min_age || 0,
            max_age: recipe.max_age || 18,
            dietary_preferences: recipe.dietary_preferences || [],
            allergens: recipe.allergens || [],
            cost_estimate: recipe.cost_estimate || 0,
            seasonal_months: recipe.seasonal_months || [1,2,3,4,5,6,7,8,9,10,11,12],
            cooking_steps: recipe.cooking_steps || []
          };

          const { data: savedRecipe, error: saveError } = await supabase
            .from('recipes')
            .insert(typedRecipe)
            .select('*')
            .single();

          if (saveError) {
            console.error('Error saving recipe:', saveError);
            continue;
          }

          console.log('Successfully saved recipe:', savedRecipe);
          savedRecipes.push(savedRecipe as Recipe);
          
        } catch (error) {
          console.error('Error processing recipe:', recipe.name, error);
          continue;
        }
      }

      if (savedRecipes.length === 0) {
        throw new Error("Aucune recette n'a pu être sauvegardée");
      }

      toast.success(`${savedRecipes.length} recettes ont été générées avec succès !`);
      return savedRecipes;

    } catch (err) {
      console.error("Error in recipe generation process:", err);
      const errorMessage = err instanceof Error ? err.message : "Une erreur est survenue";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateRecipes,
    loading,
    error
  };
};