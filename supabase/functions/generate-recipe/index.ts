
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fonction utilitaire pour nettoyer le JSON
const cleanJsonString = (str: string): string => {
  // Enlève tout ce qui n'est pas entre le premier [ et le dernier ]
  const match = str.match(/\[[\s\S]*\]/);
  if (!match) return str;
  
  let cleaned = match[0]
    // Enlève les blocs de code markdown
    .replace(/```json\s*|\s*```/g, '')
    // Enlève les caractères non-ASCII
    .replace(/[^\x20-\x7E]/g, ' ')
    // Nettoie les espaces multiples
    .replace(/\s+/g, ' ')
    // Nettoie les virgules trailing
    .replace(/,\s*]/g, ']')
    .replace(/,\s*}/g, '}')
    // S'assure que les guillemets sont droits
    .replace(/[""]/g, '"')
    .trim();

  return cleaned;
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

    const prompt = `[IMPORTANT: Réponds UNIQUEMENT avec un tableau JSON de 5 recettes]

En tant que chef cuisinier français expert, génère 5 recettes de ${filters.mealType || 'petit-déjeuner'} pour un enfant de ${childAge} ans.

Format JSON requis:
[
  {
    "name": "Nom de la recette",
    "ingredients": [
      { "item": "Ingrédient", "quantity": "quantité", "unit": "unité" }
    ],
    "instructions": ["étape 1", "étape 2"],
    "nutritional_info": { "calories": 0, "protein": 0, "carbs": 0, "fat": 0 },
    "meal_type": "${filters.mealType || 'breakfast'}",
    "preparation_time": ${filters.maxPrepTime || 30},
    "difficulty": "easy",
    "servings": 1,
    "health_benefits": [
      { "icon": "🥛", "category": "energy", "description": "description" }
    ]
  }
]

Règles:
- Temps max: ${filters.maxPrepTime || 30} minutes
- Adapté aux enfants de ${childAge} ans
${child.allergies?.length ? `- Sans: ${child.allergies.join(", ")}` : ""}

[RAPPEL: Renvoie UNIQUEMENT le JSON]`;

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
            content: 'Tu es un expert culinaire. Format de réponse: UNIQUEMENT un tableau JSON de 5 recettes. Pas de texte autour.'
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DEBUG - Perplexity API error response:", errorText);
      throw new Error(`Erreur API Perplexity: ${errorText}`);
    }

    const perplexityData = await response.json();
    console.log("DEBUG - Raw Perplexity response:", perplexityData);

    if (!perplexityData.choices?.[0]?.message?.content) {
      throw new Error("Structure de réponse Perplexity invalide");
    }

    const rawContent = perplexityData.choices[0].message.content;
    console.log("DEBUG - Raw content:", rawContent);

    // Premier nettoyage
    const cleanedContent = cleanJsonString(rawContent);
    console.log("DEBUG - Cleaned content:", cleanedContent);

    let recipes;
    try {
      recipes = JSON.parse(cleanedContent);
      console.log("DEBUG - Successfully parsed recipes:", recipes);
    } catch (error) {
      console.error("DEBUG - Parse error:", error);
      console.error("DEBUG - Failed content:", cleanedContent);
      throw new Error("Impossible de parser la réponse JSON");
    }

    if (!Array.isArray(recipes)) {
      throw new Error("La réponse n'est pas un tableau de recettes");
    }

    if (recipes.length === 0) {
      throw new Error("Aucune recette générée");
    }

    if (recipes.length < 5) {
      throw new Error(`Nombre insuffisant de recettes (${recipes.length}/5)`);
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

    console.log("DEBUG - Final processed recipes:", processedRecipes);

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
