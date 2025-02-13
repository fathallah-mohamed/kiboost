
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

    const prompt = `En tant que chef cuisinier français expert, génère 5 recettes de ${filters.mealType || 'petit-déjeuner'} DIFFÉRENTES adaptées pour un enfant de ${childAge} ans.

Ta réponse doit être UNIQUEMENT un tableau JSON de 5 recettes, sans AUCUN texte avant ou après.
Voici le format JSON attendu:

[
  {
    "name": "Porridge aux fruits",
    "ingredients": [
      { "item": "Flocons d'avoine", "quantity": "40", "unit": "g" },
      { "item": "Lait", "quantity": "200", "unit": "ml" },
      { "item": "Banane", "quantity": "1", "unit": "pièce" }
    ],
    "instructions": [
      "Faire chauffer le lait dans une casserole",
      "Ajouter les flocons d'avoine et mélanger",
      "Cuire à feu doux pendant 3-4 minutes en remuant"
    ],
    "nutritional_info": { "calories": 250, "protein": 8, "carbs": 45, "fat": 5 },
    "meal_type": "${filters.mealType || 'breakfast'}",
    "preparation_time": ${filters.maxPrepTime || 30},
    "difficulty": "easy",
    "servings": 1,
    "health_benefits": [
      { "icon": "🥛", "category": "energy", "description": "Énergie durable pour la matinée" }
    ]
  }
]

Règles pour les 5 recettes:
- Temps de préparation: moins de ${filters.maxPrepTime || 30} minutes
- Équilibrées pour un enfant de ${childAge} ans
- Variées et originales
${child.allergies?.length ? `- Sans ces allergènes: ${child.allergies.join(", ")}` : ""}

IMPORTANT: Ta réponse doit commencer par [ et finir par ], avec EXACTEMENT 5 recettes.`;

    console.log("DEBUG - Sending prompt to Perplexity:", prompt);

    const perplexityKey = Deno.env.get('PERPLEXITY_API_KEY');
    if (!perplexityKey) {
      throw new Error('Clé API Perplexity manquante');
    }

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert culinaire qui retourne UNIQUEMENT des tableaux JSON de 5 recettes, sans texte autour. Ne réponds JAMAIS avec du texte, seulement du JSON valide commençant par [ et finissant par ].'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    console.log("DEBUG - Perplexity response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("DEBUG - Perplexity API error response:", errorText);
      throw new Error(`Erreur API Perplexity: ${errorText}`);
    }

    const perplexityData = await response.json();
    console.log("DEBUG - Raw Perplexity response:", perplexityData);

    if (!perplexityData.choices?.[0]?.message?.content) {
      console.error("DEBUG - Invalid Perplexity response structure:", perplexityData);
      throw new Error("Structure de réponse Perplexity invalide");
    }

    let content = perplexityData.choices[0].message.content.trim();
    console.log("DEBUG - Content from Perplexity before cleaning:", content);

    // Nettoyage plus agressif pour s'assurer d'avoir un JSON valide
    content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    content = content.replace(/^[^[]*(\[[\s\S]*\])[^]*$/, '$1');
    
    console.log("DEBUG - Content after aggressive cleaning:", content);

    let recipes;
    try {
      recipes = JSON.parse(content);
      console.log("DEBUG - Successfully parsed recipes:", recipes);
    } catch (error) {
      console.error("DEBUG - Failed to parse recipes JSON:", error);
      console.error("DEBUG - Content that failed to parse:", content);
      
      // Tentative de récupération avec un JSON plus strict
      try {
        content = content.replace(/[^\x20-\x7E]/g, ''); // Supprime les caractères non-ASCII
        recipes = JSON.parse(content);
        console.log("DEBUG - Successfully parsed recipes after strict cleaning:", recipes);
      } catch (secondError) {
        throw new Error("La réponse n'est pas au format JSON valide après nettoyage");
      }
    }

    if (!Array.isArray(recipes)) {
      console.error("DEBUG - Recipes is not an array:", recipes);
      throw new Error("Le format de réponse est invalide (pas un tableau)");
    }

    if (recipes.length === 0) {
      console.error("DEBUG - No recipes generated");
      throw new Error("Aucune recette n'a été générée");
    }

    if (recipes.length < 5) {
      console.error("DEBUG - Not enough recipes generated:", recipes.length);
      throw new Error(`Nombre insuffisant de recettes générées (${recipes.length}/5)`);
    }

    // Traiter les recettes
    const processedRecipes = recipes.map((recipe, index) => ({
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
