import { useState } from "react";
import { Recipe, RecipeFilters, HealthBenefitCategory, MealType } from "../../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { validateMealType, validateDifficulty } from '../utils/validationUtils';
import { Json } from "@/integrations/supabase/types";

type RecipeIngredient = {
  item: string;
  quantity: string;
  unit: string;
};

type JsonObject = { [key: string]: Json };

export const useRecipeGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseIngredients = (ingredients: Json): RecipeIngredient[] => {
    if (Array.isArray(ingredients)) {
      return ingredients.map(ing => {
        const item = ing as JsonObject;
        return {
          item: String(item?.item || ''),
          quantity: String(item?.quantity || ''),
          unit: String(item?.unit || '')
        };
      });
    }
    return [];
  };

  const parseInstructions = (instructions: Json): string[] => {
    if (Array.isArray(instructions)) {
      return instructions.map(String);
    }
    if (typeof instructions === 'string') {
      try {
        const parsed = JSON.parse(instructions);
        return Array.isArray(parsed) ? parsed.map(String) : [String(instructions)];
      } catch {
        return [String(instructions)];
      }
    }
    return [];
  };

  const parseNutritionalInfo = (info: Json) => {
    const defaultInfo = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    };

    if (typeof info === 'object' && info !== null && !Array.isArray(info)) {
      const nutritionalInfo = info as JsonObject;
      return {
        calories: Number(nutritionalInfo?.calories || 0),
        protein: Number(nutritionalInfo?.protein || 0),
        carbs: Number(nutritionalInfo?.carbs || 0),
        fat: Number(nutritionalInfo?.fat || 0)
      };
    }
    return defaultInfo;
  };

  const parseHealthBenefits = (benefits: Json) => {
    if (Array.isArray(benefits)) {
      return benefits.map(benefit => {
        const b = benefit as JsonObject;
        return {
          icon: String(b?.icon || ''),
          category: String(b?.category || '') as HealthBenefitCategory,
          description: String(b?.description || '')
        };
      });
    }
    return [];
  };

  const parseCookingSteps = (steps: Json) => {
    if (Array.isArray(steps)) {
      return steps.map(step => {
        const s = step as JsonObject;
        return {
          step: Number(s?.step || 0),
          description: String(s?.description || ''),
          duration: Number(s?.duration || 0),
          tips: String(s?.tips || '')
        };
      });
    }
    return [];
  };

  const generateRecipes = async (child: { id: string; name: string; birth_date: string; allergies?: string[]; preferences?: string[]; profile_id: string }, filters: RecipeFilters) => {
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

      if (generateError) throw generateError;
      console.log("Generated recipe response:", response);

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
            ingredients: JSON.stringify(recipe.ingredients),
            instructions: JSON.stringify(recipe.instructions),
            nutritional_info: JSON.stringify(recipe.nutritional_info),
            meal_type: validateMealType(recipe.meal_type) as MealType,
            preparation_time: Number(recipe.preparation_time) || 30,
            max_prep_time: Number(filters.maxPrepTime) || 30,
            difficulty: validateDifficulty(recipe.difficulty),
            servings: Number(recipe.servings) || 4,
            auto_generated: true,
            source: 'ia',
            health_benefits: JSON.stringify(recipe.health_benefits || []),
            image_url: String(recipe.image_url || 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9'),
            min_age: Number(recipe.min_age) || 0,
            max_age: Number(recipe.max_age) || 18,
            dietary_preferences: recipe.dietary_preferences || [],
            allergens: recipe.allergens || [],
            cost_estimate: Number(recipe.cost_estimate) || 0,
            seasonal_months: recipe.seasonal_months || [1,2,3,4,5,6,7,8,9,10,11,12],
            cooking_steps: JSON.stringify(recipe.cooking_steps || []),
            is_generated: true
          };

          console.log("Saving recipe with data:", recipeData);

          const { data: savedRecipe, error: saveError } = await supabase
            .from('recipes')
            .insert(recipeData)
            .select()
            .single();

          if (saveError) throw saveError;

          if (savedRecipe) {
            const typedRecipe: Recipe = {
              ...savedRecipe,
              ingredients: parseIngredients(savedRecipe.ingredients),
              instructions: parseInstructions(savedRecipe.instructions),
              nutritional_info: parseNutritionalInfo(savedRecipe.nutritional_info),
              health_benefits: parseHealthBenefits(savedRecipe.health_benefits),
              cooking_steps: parseCookingSteps(savedRecipe.cooking_steps),
              meal_type: validateMealType(savedRecipe.meal_type) as MealType
            };
            savedRecipes.push(typedRecipe);
          }
        } catch (error) {
          console.error('Error processing recipe:', recipe.name, error);
          continue;
        }
      }

      if (savedRecipes.length === 0) {
        throw new Error("Aucune recette n'a pu être sauvegardée");
      }

      toast.success(`${savedRecipes.length} nouvelles recettes ont été générées !`);
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