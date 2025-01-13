import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useRecipeGeneration = (userId: string) => {
  const [analyzing, setAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleCreateRecipe = async (leftovers: any[]) => {
    if (!leftovers?.length) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Aucun reste disponible pour créer une recette.",
      });
      return;
    }

    try {
      setAnalyzing(true);
      const ingredients = leftovers.map(leftover => leftover.ingredient_name);
      const photos = leftovers.flatMap(leftover => leftover.photos || []);

      const { data, error } = await supabase.functions.invoke('analyze-leftovers', {
        body: { photoUrls: photos, ingredients }
      });

      if (error) throw error;

      const suggestion = data.suggestion;

      const recipeData = {
        profile_id: userId,
        name: "Recette avec restes du " + new Date().toLocaleDateString(),
        ingredients: JSON.stringify(ingredients.map(item => ({
          item,
          quantity: "à ajuster",
          unit: "selon besoin"
        }))),
        instructions: suggestion,
        nutritional_info: JSON.stringify({
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0
        }),
        meal_type: "dinner",
        preparation_time: 30,
        difficulty: "medium",
        servings: 4
      };

      const { error: saveError } = await supabase
        .from("recipes")
        .insert(recipeData);

      if (saveError) throw saveError;

      toast({
        title: "Recette créée",
        description: "Une nouvelle recette a été créée à partir des restes avec l'aide de l'IA.",
      });
    } catch (error) {
      console.error('Error creating recipe:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de la recette.",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return {
    analyzing,
    handleCreateRecipe,
  };
};