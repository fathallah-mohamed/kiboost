
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { child, filters } = await req.json();
    
    console.log("DEBUG - Received request with:", { child, filters });
    
    if (!child || !child.birth_date) {
      throw new Error("Les informations de l'enfant sont requises");
    }

    const childAge = new Date().getFullYear() - new Date(child.birth_date).getFullYear();
    console.log("DEBUG - Calculated child age:", childAge);

    // Créer une recette de test pour vérifier le format
    const testRecipes = [
      {
        "name": "Porridge aux fruits",
        "ingredients": [
          { "item": "Flocons d'avoine", "quantity": "40", "unit": "g" },
          { "item": "Lait", "quantity": "200", "unit": "ml" },
          { "item": "Banane", "quantity": "1", "unit": "pièce" },
          { "item": "Miel", "quantity": "1", "unit": "cuillère à café" }
        ],
        "instructions": [
          "Faire chauffer le lait dans une casserole",
          "Ajouter les flocons d'avoine et mélanger",
          "Cuire à feu doux pendant 3-4 minutes en remuant",
          "Couper la banane en rondelles",
          "Servir le porridge avec la banane et le miel"
        ],
        "nutritional_info": { "calories": 250, "protein": 8, "carbs": 45, "fat": 5 },
        "meal_type": "breakfast",
        "preparation_time": 10,
        "difficulty": "easy",
        "servings": 1,
        "health_benefits": [
          { "icon": "🥛", "category": "energy", "description": "Énergie durable pour la matinée" }
        ]
      }
    ];

    // Traiter les recettes de test
    const processedRecipes = testRecipes.map((recipe, index) => ({
      id: crypto.randomUUID(),
      name: String(recipe.name || `Recette ${index + 1}`),
      ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients.map(ing => ({
        item: String(ing.item || ''),
        quantity: String(ing.quantity || ''),
        unit: String(ing.unit || '')
      })) : [],
      instructions: Array.isArray(recipe.instructions) ? recipe.instructions.map(String) : [],
      nutritional_info: {
        calories: Number(recipe.nutritional_info?.calories) || 0,
        protein: Number(recipe.nutritional_info?.protein) || 0,
        carbs: Number(recipe.nutritional_info?.carbs) || 0,
        fat: Number(recipe.nutritional_info?.fat) || 0
      },
      meal_type: filters.mealType || 'breakfast',
      preparation_time: Number(recipe.preparation_time) || filters.maxPrepTime || 30,
      difficulty: recipe.difficulty || 'easy',
      servings: Number(recipe.servings) || 2,
      is_generated: true,
      profile_id: child.profile_id,
      child_id: child.id,
      health_benefits: Array.isArray(recipe.health_benefits) ? recipe.health_benefits.map(benefit => ({
        icon: String(benefit.icon || '🍳'),
        category: String(benefit.category || 'energy'),
        description: String(benefit.description || '')
      })) : [],
      image_url: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
      min_age: childAge - 2,
      max_age: childAge + 2,
      dietary_preferences: child.preferences || [],
      allergens: child.allergies || [],
      cost_estimate: 0,
      seasonal_months: [1,2,3,4,5,6,7,8,9,10,11,12],
      source: 'ia',
      auto_generated: true
    }));

    console.log("DEBUG - Final processed recipes:", JSON.stringify(processedRecipes, null, 2));

    return new Response(
      JSON.stringify({ recipes: processedRecipes }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );

  } catch (error) {
    console.error("Error in generate-recipe function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
