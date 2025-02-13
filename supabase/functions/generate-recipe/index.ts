
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
    
    if (!child || !child.birth_date) {
      throw new Error("Les informations de l'enfant sont requises");
    }

    console.log("Generating recipes for child:", child);
    console.log("Using filters:", filters);

    const childAge = new Date().getFullYear() - new Date(child.birth_date).getFullYear();

    const prompt = `Génère 3 recettes pour ${filters.mealType || 'petit-déjeuner'} adaptées pour un enfant de ${childAge} ans en suivant EXACTEMENT ce format JSON :

[
  {
    "name": "Pancakes banane-avoine",
    "ingredients": [
      { "item": "Banane mûre", "quantity": "1", "unit": "pièce" },
      { "item": "Flocons d'avoine", "quantity": "60", "unit": "g" },
      { "item": "Œuf", "quantity": "1", "unit": "pièce" },
      { "item": "Lait", "quantity": "120", "unit": "ml" }
    ],
    "instructions": [
      "Écraser la banane",
      "Mélanger avec les flocons d'avoine, l'œuf et le lait",
      "Cuire à la poêle 2-3 minutes de chaque côté"
    ],
    "nutritional_info": { "calories": 250, "protein": 8, "carbs": 35, "fat": 6 },
    "meal_type": "${filters.mealType || 'breakfast'}",
    "preparation_time": ${filters.maxPrepTime || 30},
    "difficulty": "easy",
    "servings": 2,
    "health_benefits": [
      { "icon": "🍌", "category": "energy", "description": "Énergie durable pour la matinée" }
    ]
  }
]

Les recettes doivent:
- Prendre moins de ${filters.maxPrepTime || 30} minutes
- Être adaptées pour un enfant de ${childAge} ans
${child.allergies?.length ? `- Éviter ces allergènes: ${child.allergies.join(", ")}` : ""}

IMPORTANT: Ne retourne QUE le JSON, sans texte avant ou après. Le JSON doit commencer par [ et finir par ].`;

    console.log("Sending prompt to Perplexity:", prompt);

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
            content: 'Tu es un expert culinaire français qui génère des recettes pour enfants. Tu retournes UNIQUEMENT du JSON valide, sans texte autour.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Perplexity API error response:", errorText);
      throw new Error(`Erreur API Perplexity: ${errorText}`);
    }

    const perplexityData = await response.json();
    console.log("Raw Perplexity response:", perplexityData);

    if (!perplexityData.choices?.[0]?.message?.content) {
      console.error("Invalid Perplexity response structure:", perplexityData);
      throw new Error("Structure de réponse Perplexity invalide");
    }

    let content = perplexityData.choices[0].message.content.trim();
    console.log("Content from Perplexity before cleaning:", content);

    // S'assurer que le contenu commence par [ et se termine par ]
    content = content.replace(/^[^[]*(\[[\s\S]*\])[^]*$/, '$1');
    console.log("Content after cleaning:", content);

    let recipes;
    try {
      recipes = JSON.parse(content);
      console.log("Successfully parsed recipes:", recipes);
    } catch (error) {
      console.error("Failed to parse recipes JSON:", error);
      console.error("Content that failed to parse:", content);
      throw new Error("La réponse n'est pas au format JSON valide");
    }

    if (!Array.isArray(recipes) || recipes.length === 0) {
      throw new Error("Aucune recette n'a été générée");
    }

    // Traiter et valider chaque recette
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

    console.log("Final processed recipes:", processedRecipes);

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
