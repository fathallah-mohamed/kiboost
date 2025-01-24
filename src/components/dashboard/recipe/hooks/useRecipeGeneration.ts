import { useState } from "react";
import { Recipe, ChildProfile, RecipeFilters } from "../../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSession } from "@supabase/auth-helpers-react";
import { useRecipeSaving } from "./useRecipeSaving";

const normalizeString = (str: string) => {
  return str.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
};

const areRecipesSimilar = (recipe1: Recipe, recipe2: Recipe) => {
  const name1 = normalizeString(recipe1.name);
  const name2 = normalizeString(recipe2.name);
  return name1 === name2 || 
    (name1.includes(name2) && name2.length > 5) || 
    (name2.includes(name1) && name1.length > 5);
};

export const useRecipeGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const session = useSession();
  const { saveRecipe } = useRecipeSaving();

  const checkExistingRecipe = async (recipeName: string): Promise<boolean> => {
    if (!session?.user?.id) return false;

    const { data: existingRecipes } = await supabase
      .from('recipes')
      .select('name')
      .eq('profile_id', session.user.id)
      .eq('is_generated', true);

    if (!existingRecipes) return false;

    const normalizedNewName = normalizeString(recipeName);
    return existingRecipes.some(recipe => 
      normalizeString(recipe.name) === normalizedNewName
    );
  };

  const generateRecipes = async (child: ChildProfile, filters: RecipeFilters) => {
    try {
      setLoading(true);
      setError(null);

      console.log("Generating recipes for child:", child);
      console.log("Using filters:", filters);

      const { data: response, error: generateError } = await supabase.functions.invoke(
        'generate-recipe',
        {
          body: { 
            child: {
              ...child,
              id: child.id,
              name: child.name,
              birth_date: child.birth_date,
              allergies: child.allergies || [],
              preferences: child.preferences || []
            },
            filters
          }
        }
      );

      if (generateError) throw generateError;
      console.log("Generated recipe response:", response);

      if (!response.recipes || !Array.isArray(response.recipes)) {
        throw new Error("Format de réponse invalide");
      }

      // Filter out duplicates from the generated recipes
      const uniqueRecipes = response.recipes.reduce((acc: Recipe[], recipe: Recipe) => {
        const isDuplicate = acc.some(existingRecipe => 
          areRecipesSimilar(existingRecipe, recipe)
        );
        if (!isDuplicate) {
          acc.push(recipe);
        }
        return acc;
      }, []);

      // Save each unique generated recipe to the database
      const savedRecipes = await Promise.all(
        uniqueRecipes.map(async (recipe: Recipe) => {
          const exists = await checkExistingRecipe(recipe.name);
          if (exists) {
            console.log(`Recipe "${recipe.name}" already exists, skipping...`);
            return null;
          }

          const recipeWithMetadata = {
            ...recipe,
            is_generated: true,
            profile_id: session?.user?.id
          };
          
          try {
            await saveRecipe(recipeWithMetadata);
            return recipeWithMetadata;
          } catch (error) {
            console.error('Error saving generated recipe:', error);
            toast.error(`Erreur lors de la sauvegarde de la recette ${recipe.name}`);
            return null;
          }
        })
      );

      // Filter out any recipes that failed to save
      const successfullySavedRecipes = savedRecipes.filter((recipe): recipe is Recipe => recipe !== null);

      if (successfullySavedRecipes.length > 0) {
        toast.success(`${successfullySavedRecipes.length} recettes générées et sauvegardées`);
      }

      return successfullySavedRecipes;

    } catch (err) {
      console.error("Error generating recipes:", err);
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