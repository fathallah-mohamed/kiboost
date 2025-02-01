import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { child, filters } = await req.json();
    
    if (!child || !child.birth_date) {
      throw new Error("Les informations de l'enfant sont requises");
    }

    console.log("Generating recipes for child:", child);
    console.log("Using filters:", filters);

    const validCategories = [
      'cognitive', 'energy', 'satiety', 'digestive', 'immunity',
      'growth', 'mental', 'organs', 'beauty', 'physical',
      'prevention', 'global'
    ];

    let constraints = [];
    if (filters?.mealType && filters.mealType !== 'all') {
      constraints.push(`Type de repas : ${filters.mealType}`);
    }
    if (filters?.maxPrepTime) {
      constraints.push(`Temps maximum : ${filters.maxPrepTime}min`);
    }
    if (filters?.difficulty && filters.difficulty !== 'all') {
      constraints.push(`Difficulté : ${filters.difficulty}`);
    }

    const prompt = `Tu es un chef expert en nutrition infantile. Ta mission est de générer 3 recettes SAINES, VARIÉES et ADAPTÉES aux besoins spécifiques d'un enfant.

🔹 **Profil de l'enfant :**
- **Âge** : ${new Date().getFullYear() - new Date(child.birth_date).getFullYear()} ans
- **Allergies** : ${child.allergies?.length ? child.allergies.join(", ") : "Aucune"}
- **Préférences alimentaires** : ${child.preferences?.length ? child.preferences.join(", ") : "Aucune préférence particulière"}

🔹 **Critères spécifiques à respecter :**
${constraints.length ? '- ' + constraints.join("\n- ") : "- Aucune contrainte particulière"}

🎯 **Exigences incontournables pour chaque recette :**
- **VARIÉTÉ** : Chaque recette doit être UNIQUE, avec des ingrédients et techniques de préparation distincts.
- **SANTÉ** : Doit inclure **exactement 3 bienfaits santé distincts** parmi : ${validCategories.join(", ")}.
- **ÉVITE LES RÉPÉTITIONS** : Les recettes doivent être différentes en goût, texture et préparation.
- **ACCESSIBILITÉ** : Utiliser des ingrédients simples, courants et faciles à trouver.
- **SAISONNALITÉ** : Prioriser les ingrédients de saison si une contrainte est définie.
- **COÛT** : Respecter un budget raisonnable par portion si précisé.
- **FACILITÉ** : Étapes claires, simples et adaptées aux parents occupés.

⚠️ **Retourne uniquement un tableau JSON strictement formaté comme suit :**
[
  {
    "name": "Nom de la recette",
    "ingredients": [
      {"item": "Nom de l'ingrédient", "quantity": "Valeur", "unit": "Unité (g, ml, etc.)"}
    ],
    "instructions": ["Étape 1", "Étape 2"],
    "nutritional_info": {
      "calories": 0,
      "protein": 0,
      "carbs": 0,
      "fat": 0
    },
    "meal_type": "breakfast" | "lunch" | "dinner" | "snack",
    "preparation_time": nombre,
    "difficulty": "easy" | "medium" | "hard",
    "servings": nombre,
    "health_benefits": [
      {"icon": "string", "category": "string", "description": "string"}
    ],
    "min_age": nombre,
    "max_age": nombre,
    "dietary_preferences": ["Préférences spécifiques"],
    "allergens": ["Liste des allergènes"],
    "cost_estimate": nombre,
    "seasonal_months": [1,2,3,4,5,6,7,8,9,10,11,12],
    "cooking_steps": [
      {"step": nombre, "description": "Détail de l'étape", "duration": nombre, "tips": "Astuces optionnelles"}
    ]
  }
]`;

    console.log("Sending prompt to OpenAI:", prompt);

    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiKey) {
      throw new Error('OpenAI API key is missing');
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Tu es un chef spécialisé dans la nutrition infantile. Tu crées des recettes uniques, saines et attrayantes pour les enfants. Retourne TOUJOURS les données au format JSON pur sans markdown ni texte supplémentaire."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.9,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenAI API error:", error);
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    console.log("OpenAI Response:", data);

    if (!data.choices?.[0]?.message?.content) {
      throw new Error("Réponse invalide d'OpenAI");
    }

    let recipes;
    try {
      const content = data.choices[0].message.content;
      console.log("Raw OpenAI response content:", content);
      
      // Clean the response to ensure it's valid JSON
      const cleanContent = content.replace(/```json\n|\n```|```/g, '').trim();
      console.log("Cleaned content:", cleanContent);
      
      recipes = JSON.parse(cleanContent);
      
      if (!Array.isArray(recipes)) {
        recipes = [recipes];
      }

      // Validate and transform each recipe
      recipes = recipes.map(recipe => ({
        ...recipe,
        ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
        instructions: Array.isArray(recipe.instructions) ? recipe.instructions : [],
        nutritional_info: recipe.nutritional_info || {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0
        },
        health_benefits: Array.isArray(recipe.health_benefits) ? recipe.health_benefits : [],
        cooking_steps: Array.isArray(recipe.cooking_steps) ? recipe.cooking_steps : [],
        dietary_preferences: Array.isArray(recipe.dietary_preferences) ? recipe.dietary_preferences : [],
        allergens: Array.isArray(recipe.allergens) ? recipe.allergens : [],
        seasonal_months: Array.isArray(recipe.seasonal_months) ? recipe.seasonal_months : [1,2,3,4,5,6,7,8,9,10,11,12]
      }));

      console.log("Recipes processed successfully:", recipes);
    } catch (e) {
      console.error("Error processing recipe data:", e);
      throw new Error(`Failed to process recipe data: ${e.message}`);
    }

    return new Response(
      JSON.stringify({ recipes }),
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