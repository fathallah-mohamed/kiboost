
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const validCategories = [
  'cognitive', 'energy', 'satiety', 'digestive', 'immunity',
  'growth', 'mental', 'organs', 'beauty', 'physical',
  'prevention', 'global'
];

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

    // Suggestions de base par type de repas
    const mealSuggestions = {
      breakfast: [
        "Porridge aux fruits",
        "Toast à l'avocat",
        "Pancakes aux légumes",
        "Smoothie bowl"
      ],
      lunch: [
        "Sandwich wrap",
        "Salade composée",
        "Pâtes aux légumes",
        "Bowl de quinoa"
      ],
      dinner: [
        "Gratin léger",
        "Wok de légumes",
        "Omelette garnie",
        "Pizza légère"
      ],
      snack: [
        "Smoothie fruité",
        "Muffin aux légumes",
        "Fruits découpés",
        "Tartine gourmande"
      ]
    };

    const mealType = filters.mealType || 'dinner';
    const suggestions = mealSuggestions[mealType as keyof typeof mealSuggestions] || 
                       mealSuggestions.dinner;

    const prompt = `Génère trois recettes en JSON pour un enfant de ${childAge} ans.
Type de repas : ${mealType}
Temps max : ${filters.maxPrepTime || '30'} minutes
Difficulté : ${filters.difficulty || 'facile'}
Allergies : ${child.allergies?.join(", ") || "aucune"}

Voici des exemples de recettes à adapter : ${suggestions.join(", ")}

Format JSON attendu (UNIQUEMENT le JSON, pas de texte autour) :
[
  {
    "name": "Nom de la recette 1",
    "ingredients": [
      {"item": "Ingrédient", "quantity": "100", "unit": "g"}
    ],
    "instructions": ["Étape 1"],
    "nutritional_info": {"calories": 100, "protein": 5, "carbs": 20, "fat": 2},
    "meal_type": "${mealType}",
    "preparation_time": ${filters.maxPrepTime || 30},
    "difficulty": "${filters.difficulty || 'medium'}",
    "servings": 4,
    "health_benefits": [{"icon": "🧠", "category": "cognitive", "description": "Description"}]
  }
]`;

    console.log("Sending prompt to Perplexity:", prompt);

    const perplexityKey = Deno.env.get('PERPLEXITY_API_KEY');
    if (!perplexityKey) {
      throw new Error('Perplexity API key is missing');
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
            content: 'Tu es un assistant qui génère uniquement du JSON. Ne mets jamais de texte ou markdown autour du JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7, // Augmenté pour plus de variété
        max_tokens: 2000, // Augmenté pour s'assurer d'avoir assez de tokens
        top_p: 0.95,
        frequency_penalty: 0.5,
        presence_penalty: 0.5
      }),
    });

    const responseText = await response.text();
    console.log("Raw Perplexity response:", responseText);

    if (!response.ok) {
      throw new Error(`Erreur Perplexity: ${responseText}`);
    }

    const data = JSON.parse(responseText);
    console.log("Parsed Perplexity Response:", data);

    if (!data.choices?.[0]?.message?.content) {
      throw new Error("Réponse invalide de Perplexity");
    }

    let content = data.choices[0].message.content.trim();
    console.log("Content before cleaning:", content);
    
    // Nettoyer le contenu pour extraire uniquement le JSON valide
    content = content.replace(/^[^[]*(\[[\s\S]*\])[^]*$/, '$1');
    content = content.replace(/```json\s*([\s\S]*?)\s*```/g, '$1');
    console.log("Cleaned content:", content);

    let recipes;
    try {
      recipes = JSON.parse(content);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Invalid JSON content:", content);
      throw new Error("La réponse n'est pas au format JSON valide");
    }

    if (!Array.isArray(recipes)) {
      throw new Error("Le format de réponse n'est pas un tableau");
    }

    if (recipes.length === 0) {
      throw new Error("Aucune recette n'a été générée");
    }

    const processedRecipes = recipes.map(recipe => ({
      profile_id: child.profile_id,
      child_id: child.id,
      name: String(recipe.name || `Recette ${mealType}`),
      ingredients: (recipe.ingredients || []).map(ing => ({
        item: String(ing.item || ''),
        quantity: String(ing.quantity || ''),
        unit: String(ing.unit || '')
      })),
      instructions: (recipe.instructions || []).map(String),
      nutritional_info: {
        calories: Number(recipe.nutritional_info?.calories || 0),
        protein: Number(recipe.nutritional_info?.protein || 0),
        carbs: Number(recipe.nutritional_info?.carbs || 0),
        fat: Number(recipe.nutritional_info?.fat || 0)
      },
      meal_type: mealType,
      preparation_time: Number(filters.maxPrepTime) || 30,
      difficulty: filters.difficulty || 'medium',
      servings: Number(recipe.servings || 4),
      is_generated: true,
      source: 'ia',
      auto_generated: true,
      health_benefits: (recipe.health_benefits || []).map(benefit => ({
        icon: String(benefit.icon || '🍳'),
        category: benefit.category || 'global',
        description: String(benefit.description || '')
      })),
      image_url: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
      min_age: childAge - 2,
      max_age: childAge + 2,
      dietary_preferences: child.preferences || [],
      allergens: child.allergies || [],
      cost_estimate: 0,
      seasonal_months: [1,2,3,4,5,6,7,8,9,10,11,12],
      cooking_steps: []
    }));

    console.log("Processed recipes:", processedRecipes);

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
