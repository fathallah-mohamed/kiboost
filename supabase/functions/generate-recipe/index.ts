
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fonction pour convertir le type de repas en format français
const normalizeMealType = (mealType: string): string => {
  const mealTypes: Record<string, string> = {
    'breakfast': 'petit-déjeuner',
    'lunch': 'déjeuner',
    'dinner': 'dîner',
    'snack': 'goûter',
    'all': 'tous'
  };
  return mealTypes[mealType] || 'petit-déjeuner';
};

// Fonction pour normaliser les attributs de difficulté
const normalizeDifficulty = (difficulty: string): string => {
  const difficulties: Record<string, string> = {
    'easy': 'facile',
    'medium': 'moyen',
    'hard': 'difficile',
    'all': 'tous'
  };
  return difficulties[difficulty] || 'facile';
};

// Fonction améliorée pour nettoyer les réponses JSON
const cleanJsonString = (str: string): string => {
  // Identifier tout ce qui ressemble à un tableau JSON
  const match = str.match(/\[\s*\{[\s\S]*\}\s*\]/);
  if (!match) return str;
  
  let cleaned = match[0]
    // Supprimer les marqueurs markdown
    .replace(/```(?:json)?\s*|\s*```/g, '')
    // Remplacer les caractères non-ASCII
    .replace(/[^\x20-\x7E]/g, ' ')
    // Normaliser les espaces
    .replace(/\s+/g, ' ')
    // Supprimer les virgules en fin d'objets/tableaux
    .replace(/,(\s*[}\]])/g, '$1')
    // Normaliser les guillemets
    .replace(/[""'']/g, '"')
    .trim();

  // Assurer que les valeurs numériques sont correctement formatées
  cleaned = cleaned.replace(/:(\s*)([0-9]+)([a-zA-Z]+)(\s*[,}])/g, ':"$2$3"$4');
  
  return cleaned;
};

// Fonction pour valider la structure de base des recettes
const validateRecipeStructure = (recipe: any): boolean => {
  if (!recipe || typeof recipe !== 'object') return false;
  if (!recipe.name || typeof recipe.name !== 'string') return false;
  if (!Array.isArray(recipe.ingredients)) return false;
  if (!Array.isArray(recipe.instructions)) return false;
  if (!recipe.nutritional_info || typeof recipe.nutritional_info !== 'object') return false;
  return true;
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
    const normalizedMealType = normalizeMealType(filters?.mealType || 'breakfast');
    const normalizedDifficulty = normalizeDifficulty(filters?.difficulty || 'easy');
    
    console.log("DEBUG - Calculated child age:", childAge);
    console.log("DEBUG - Normalized meal type:", normalizedMealType);
    console.log("DEBUG - Normalized difficulty:", normalizedDifficulty);
    
    // Construction du prompt amélioré
    const dietaryRestrictions = child.allergies?.filter(Boolean).join(", ") || "";
    const dietaryPreferences = child.preferences?.filter(Boolean).join(", ") || "";
    const maxPrepTime = filters?.maxPrepTime || 30;
    
    // Introduire un élément aléatoire pour garantir des recettes différentes
    const timestamp = new Date().getTime();
    const randomSeed = Math.floor(Math.random() * 10000);

    const prompt = `[INSTRUCTION: Réponds UNIQUEMENT avec un tableau JSON de 5 recettes différentes, sans texte d'introduction ou de conclusion]

En tant que chef cuisinier français expert, génère 5 recettes de ${normalizedMealType} pour un enfant de ${childAge} ans avec le seed ${randomSeed}-${timestamp}.

Format JSON requis:
[
  {
    "name": "Nom de la recette",
    "ingredients": [
      { "item": "Ingrédient", "quantity": "quantité", "unit": "unité" }
    ],
    "instructions": ["étape 1", "étape 2"],
    "nutritional_info": { "calories": 0, "protein": 0, "carbs": 0, "fat": 0 },
    "meal_type": "${filters?.mealType || 'breakfast'}",
    "preparation_time": ${maxPrepTime},
    "difficulty": "${filters?.difficulty || 'easy'}",
    "servings": 1,
    "health_benefits": [
      { "icon": "🥛", "category": "energy", "description": "description" }
    ]
  }
]

Règles importantes:
- Temps max: ${maxPrepTime} minutes
- Difficulté: ${normalizedDifficulty}
- Adapté aux enfants de ${childAge} ans
${dietaryRestrictions ? `- Allergies/restrictions: ${dietaryRestrictions}` : "- Pas d'allergies connues"}
${dietaryPreferences ? `- Préférences: ${dietaryPreferences}` : ""}
${filters?.includedIngredients?.length ? `- Doit inclure: ${filters.includedIngredients.join(', ')}` : ""}
${filters?.excludedIngredients?.length ? `- Ne doit pas inclure: ${filters.excludedIngredients.join(', ')}` : ""}
${filters?.healthBenefits?.length ? `- Bienfaits santé ciblés: ${filters.healthBenefits.join(', ')}` : ""}

[IMPORTANT: Retourne UNIQUEMENT le JSON sans autre texte]`;

    console.log("DEBUG - Sending prompt to OpenAI:", prompt);

    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      throw new Error('Clé API OpenAI manquante');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: 'system',
            content: 'Tu es un chef cuisinier spécialisé pour les enfants. Tu génères des recettes sous format JSON uniquement, sans texte d\'introduction ou de conclusion. Chaque élément JSON doit être correctement formaté.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DEBUG - OpenAI API error response:", errorText);
      throw new Error(`Erreur API OpenAI: ${errorText}`);
    }

    const openaiData = await response.json();
    console.log("DEBUG - Raw OpenAI response:", openaiData);

    if (!openaiData.choices?.[0]?.message?.content) {
      throw new Error("Structure de réponse OpenAI invalide");
    }

    const rawContent = openaiData.choices[0].message.content;
    console.log("DEBUG - Raw content:", rawContent);

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

    // Validation approfondie des recettes
    recipes.forEach((recipe, index) => {
      if (!validateRecipeStructure(recipe)) {
        console.error(`DEBUG - Invalid recipe structure at index ${index}:`, recipe);
        throw new Error(`Structure de recette invalide: ${recipe.name || `Recette ${index + 1}`}`);
      }
    });

    const processedRecipes = recipes.map((recipe, index) => ({
      id: crypto.randomUUID(),
      name: String(recipe.name || `Recette ${index + 1}`),
      ingredients: (Array.isArray(recipe.ingredients) ? recipe.ingredients : []).map(ing => ({
        item: String(ing.item || ''),
        quantity: String(ing.quantity || ''),
        unit: String(ing.unit || '')
      })),
      instructions: Array.isArray(recipe.instructions) ? recipe.instructions.map(String) : [],
      nutritional_info: {
        calories: Number(recipe.nutritional_info?.calories) || 0,
        protein: Number(recipe.nutritional_info?.protein) || 0,
        carbs: Number(recipe.nutritional_info?.carbs) || 0,
        fat: Number(recipe.nutritional_info?.fat) || 0
      },
      meal_type: filters?.mealType || 'breakfast',
      preparation_time: Number(recipe.preparation_time) || maxPrepTime,
      difficulty: recipe.difficulty || 'easy',
      servings: Number(recipe.servings) || 2,
      is_generated: true,
      profile_id: child.profile_id,
      child_id: child.id,
      health_benefits: (Array.isArray(recipe.health_benefits) ? recipe.health_benefits : []).map(benefit => ({
        icon: String(benefit.icon || '🍳'),
        category: String(benefit.category || 'energy'),
        description: String(benefit.description || '')
      })),
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
