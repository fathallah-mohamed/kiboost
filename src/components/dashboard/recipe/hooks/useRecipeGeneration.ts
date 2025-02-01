import { useState } from "react";
import { Recipe, RecipeFilters, ChildProfile } from "../../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

interface DbRecipe {
  id: string;
  profile_id: string;
  name: string;
  ingredients: Json;
  instructions: string;
  nutritional_info: Json;
  meal_type: string;
  preparation_time: number;
  difficulty: string;
  servings: number;
  is_generated: boolean;
  image_url: string;
  health_benefits: Json;
  min_age: number;
  max_age: number;
  dietary_preferences: string[];
  allergens: string[];
  cost_estimate: number;
  seasonal_months: number[];
  cooking_steps: Json;
  child_id: string;
  max_prep_time: number;
  source: string;
  auto_generated: boolean;
}

interface Ingredient {
  item: string;
  quantity: string;
  unit: string;
}

interface NutritionalInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface CookingStep {
  step: number;
  description: string;
  duration?: number;
  tips?: string;
}

export const useRecipeGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseIngredients = (ingredients: Json): Ingredient[] => {
    if (!Array.isArray(ingredients)) return [];
    
    return ingredients.map(ing => ({
      item: typeof ing.item === 'string' ? ing.item : '',
      quantity: typeof ing.quantity === 'string' ? ing.quantity : '',
      unit: typeof ing.unit === 'string' ? ing.unit : ''
    }));
  };

  const parseNutritionalInfo = (info: Json): NutritionalInfo => {
    if (typeof info !== 'object' || !info) {
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }

    return {
      calories: typeof info.calories === 'number' ? info.calories : 0,
      protein: typeof info.protein === 'number' ? info.protein : 0,
      carbs: typeof info.carbs === 'number' ? info.carbs : 0,
      fat: typeof info.fat === 'number' ? info.fat : 0
    };
  };

  const parseCookingSteps = (steps: Json): CookingStep[] => {
    if (!Array.isArray(steps)) return [];

    return steps.map(step => ({
      step: typeof step.step === 'number' ? step.step : 0,
      description: typeof step.description === 'string' ? step.description : '',
      duration: typeof step.duration === 'number' ? step.duration : undefined,
      tips: typeof step.tips === 'string' ? step.tips : undefined
    }));
  };

  const transformDbRecipeToRecipe = (dbRecipe: DbRecipe): Recipe => {
    return {
      ...dbRecipe,
      ingredients: parseIngredients(dbRecipe.ingredients),
      instructions: Array.isArray(dbRecipe.instructions) 
        ? dbRecipe.instructions.map(String)
        : [String(dbRecipe.instructions)],
      nutritional_info: parseNutritionalInfo(dbRecipe.nutritional_info),
      health_benefits: Array.isArray(dbRecipe.health_benefits) 
        ? dbRecipe.health_benefits.map(benefit => ({
            icon: String(benefit.icon || ''),
            category: String(benefit.category || ''),
            description: String(benefit.description || '')
          }))
        : [],
      cooking_steps: parseCookingSteps(dbRecipe.cooking_steps)
    };
  };

  const generateRecipes = async (child: ChildProfile, filters: RecipeFilters) => {
    if (!child.name || !child.birth_date) {
      throw new Error("Les informations de l'enfant sont incomplètes");
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
              id: child.id,
              name: child.name,
              birth_date: child.birth_date,
              allergies: child.allergies || [],
              preferences: child.preferences || [],
              profile_id: child.profile_id
            },
            filters
          }
        }
      );

      if (generateError) {
        console.error("Error from generate-recipe function:", generateError);
        throw new Error(generateError.message || "Erreur lors de la génération des recettes");
      }

      console.log("Response from generate-recipe:", response);

      if (!response?.recipes || !Array.isArray(response.recipes)) {
        throw new Error("Format de réponse invalide");
      }

      const savedRecipes: Recipe[] = [];

      for (const recipe of response.recipes) {
        try {
          console.log("Processing recipe:", recipe);

          const recipeData = {
            profile_id: child.profile_id,
            child_id: child.id,
            name: String(recipe.name),
            ingredients: recipe.ingredients,
            instructions: recipe.instructions,
            nutritional_info: recipe.nutritional_info,
            meal_type: recipe.meal_type || 'dinner',
            preparation_time: Number(recipe.preparation_time) || 30,
            max_prep_time: Number(filters.maxPrepTime) || 30,
            difficulty: recipe.difficulty || 'medium',
            servings: Number(recipe.servings) || 4,
            auto_generated: true,
            source: 'ia',
            health_benefits: recipe.health_benefits || [],
            cooking_steps: recipe.cooking_steps || [],
            image_url: String(recipe.image_url || 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9'),
            min_age: Number(recipe.min_age) || 0,
            max_age: Number(recipe.max_age) || 18,
            dietary_preferences: Array.isArray(recipe.dietary_preferences)
              ? recipe.dietary_preferences
              : [],
            allergens: Array.isArray(recipe.allergens)
              ? recipe.allergens
              : [],
            cost_estimate: Number(recipe.cost_estimate) || 0,
            seasonal_months: Array.isArray(recipe.seasonal_months)
              ? recipe.seasonal_months
              : [1,2,3,4,5,6,7,8,9,10,11,12],
            is_generated: true
          };

          console.log("Saving recipe with data:", recipeData);

          const { data: savedRecipe, error: saveError } = await supabase
            .from('recipes')
            .insert(recipeData)
            .select()
            .single();

          if (saveError) {
            console.error("Error saving recipe:", saveError);
            throw saveError;
          }

          if (savedRecipe) {
            savedRecipes.push(transformDbRecipeToRecipe(savedRecipe as DbRecipe));
          }
        } catch (error) {
          console.error('Error processing recipe:', recipe.name, error);
          continue;
        }
      }

      if (savedRecipes.length === 0) {
        throw new Error("Aucune recette n'a pu être sauvegardée");
      }

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