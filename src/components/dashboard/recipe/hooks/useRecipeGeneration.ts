import { useState } from "react";
import { Recipe, RecipeFilters, ChildProfile } from "../../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSession } from "@supabase/auth-helpers-react";

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

      // Générer une image pour chaque recette de manière séquentielle
      const recipesWithImages = [];
      for (const recipe of response.recipes) {
        try {
          console.log("Generating image for recipe:", recipe.name);
          
          const { data: imageData, error: imageError } = await supabase.functions.invoke(
            'generate-recipe-image',
            {
              body: {
                recipeName: recipe.name,
                ingredients: recipe.ingredients.map(ing => ing.item).join(', ')
              }
            }
          );

          if (imageError) {
            console.error('Error generating image:', imageError);
            recipesWithImages.push({
              ...recipe,
              image_url: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9'
            });
            continue;
          }

          console.log('Generated image data for', recipe.name, ':', imageData);
          
          // Sauvegarder la recette avec l'image générée
          const { data: savedRecipe, error: saveError } = await supabase
            .from('recipes')
            .insert({
              ...recipe,
              profile_id: session.user.id,
              is_generated: true,
              image_url: imageData.imageUrl
            })
            .select('*')
            .single();

          if (saveError) {
            console.error('Error saving recipe:', saveError);
            toast.error(`Erreur lors de la sauvegarde de la recette ${recipe.name}`);
            continue;
          }

          recipesWithImages.push(savedRecipe);
          
        } catch (imageError) {
          console.error('Error generating image for recipe:', recipe.name, imageError);
          const { data: savedRecipe, error: saveError } = await supabase
            .from('recipes')
            .insert({
              ...recipe,
              profile_id: session.user.id,
              is_generated: true,
              image_url: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9'
            })
            .select('*')
            .single();

          if (saveError) {
            console.error('Error saving recipe:', saveError);
            continue;
          }

          recipesWithImages.push(savedRecipe);
        }
      }

      console.log("Final recipes with images:", recipesWithImages);
      return recipesWithImages;

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