import { useState } from "react";
import { Recipe, RecipeFilters, ChildProfile } from "../../types";
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

      const savedRecipes = [];
      
      for (const recipe of response.recipes) {
        try {
          console.log("Generating image for recipe:", recipe.name);
          
          const ingredients = recipe.ingredients.map(ing => ing.item).join(', ');
          
          const { data: imageData, error: imageError } = await supabase.functions.invoke(
            'generate-recipe-image',
            {
              body: {
                recipeName: recipe.name,
                ingredients: ingredients
              }
            }
          );

          if (imageError) {
            console.error('Error generating image:', imageError);
            throw imageError;
          }

          if (!imageData?.imageUrl) {
            throw new Error('No image URL returned');
          }

          console.log('Generated image URL:', imageData.imageUrl);

          const timestamp = new Date().toISOString();
          
          const { data: savedRecipe, error: saveError } = await supabase
            .from('recipes')
            .insert({
              ...recipe,
              profile_id: session.user.id,
              is_generated: true,
              image_url: imageData.imageUrl,
              created_at: timestamp,
              updated_at: timestamp
            })
            .select('*')
            .single();

          if (saveError) {
            console.error('Error saving recipe:', saveError);
            throw saveError;
          }

          console.log('Successfully saved recipe:', savedRecipe);
          savedRecipes.push(savedRecipe);
          
        } catch (error) {
          console.error('Error processing recipe:', recipe.name, error);
          
          // Try to save with default image if image generation fails
          const timestamp = new Date().toISOString();
          const { data: savedRecipe, error: saveError } = await supabase
            .from('recipes')
            .insert({
              ...recipe,
              profile_id: session.user.id,
              is_generated: true,
              image_url: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
              created_at: timestamp,
              updated_at: timestamp
            })
            .select('*')
            .single();

          if (saveError) {
            console.error('Error saving recipe with default image:', saveError);
            continue;
          }

          savedRecipes.push(savedRecipe);
        }
      }

      console.log("Final saved recipes:", savedRecipes);
      return savedRecipes;

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