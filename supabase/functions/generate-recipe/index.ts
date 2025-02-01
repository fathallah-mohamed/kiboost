import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
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

    const prompt = `Tu es un chef expert en nutrition infantile spécialisé dans la création de recettes UNIQUES et ADAPTÉES. Ta mission est de générer 8 recettes DIFFÉRENTES qui respectent STRICTEMENT les critères suivants:

🔹 **Profil de l'enfant :**
- **Âge** : ${new Date().getFullYear() - new Date(child.birth_date).getFullYear()} ans
- **Allergies** : ${child.allergies?.length ? child.allergies.join(", ") : "Aucune"}
- **Préférences** : ${child.preferences?.length ? child.preferences.join(", ") : "Aucune préférence particulière"}

🔹 **Critères STRICTS à respecter :**
${constraints.length ? '- ' + constraints.join("\n- ") : "- Aucune contrainte particulière"}

🎯 **Règles OBLIGATOIRES pour chaque recette :**
1. **UNICITÉ** : Chaque recette DOIT être TOTALEMENT DIFFÉRENTE des autres en termes d'ingrédients principaux et de méthode de préparation.
2. **TEMPS** : Si un temps maximum est spécifié, la recette DOIT pouvoir être réalisée dans ce temps.
3. **SIMPLICITÉ** : Pour les recettes faciles, utiliser maximum 5-6 ingrédients et 3-4 étapes simples.
4. **SANTÉ** : Inclure EXACTEMENT 3 bienfaits santé distincts parmi : ${validCategories.join(", ")}.
5. **PRATIQUE** : Utiliser des ingrédients courants qu'on trouve facilement en supermarché.
6. **ADAPTABILITÉ** : La recette doit pouvoir être préparée par un parent même pressé.
7. **DIVERSITÉ** : Varier les types de plats, les ingrédients et les techniques de cuisson.

⚠️ **Format JSON STRICT pour chaque recette :**
{
  "name": "Nom unique et descriptif",
  "ingredients": [{"item": "Nom", "quantity": "Valeur", "unit": "Unité"}],
  "instructions": ["Étape 1", "Étape 2"],
  "nutritional_info": {"calories": 0, "protein": 0, "carbs": 0, "fat": 0},
  "meal_type": "breakfast" | "lunch" | "dinner" | "snack",
  "preparation_time": nombre (en minutes),
  "difficulty": "easy" | "medium" | "hard",
  "servings": nombre,
  "health_benefits": [
    {"icon": "emoji", "category": "catégorie", "description": "description"}
  ],
  "min_age": nombre,
  "max_age": nombre,
  "dietary_preferences": ["préférences"],
  "allergens": ["allergènes"],
  "cost_estimate": nombre,
  "seasonal_months": [1-12],
  "cooking_steps": [
    {"step": nombre, "description": "détail", "duration": minutes, "tips": "astuce"}
  ]
}

⚠️ IMPORTANT: Retourne UNIQUEMENT un tableau JSON avec 8 recettes UNIQUES, sans texte additionnel.`;

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
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Tu es un chef expert en nutrition infantile qui crée des recettes uniques, saines et adaptées aux enfants. Retourne UNIQUEMENT du JSON pur, sans texte ni markdown."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 1.0,
        max_tokens: 4000,
        presence_penalty: 0.6,
        frequency_penalty: 0.8
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
      
      // Clean the content and ensure it's valid JSON
      const cleanContent = content
        .replace(/```json\n|\n```|```/g, '')
        .trim()
        .replace(/\n/g, ' ')
        .replace(/,\s*}/g, '}')
        .replace(/,\s*\]/g, ']');
      
      console.log("Cleaned content:", cleanContent);
      
      recipes = JSON.parse(cleanContent);
      
      if (!Array.isArray(recipes)) {
        recipes = [recipes];
      }

      // Validation et transformation
      recipes = recipes.map(recipe => ({
        ...recipe,
        ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients.map(ing => ({
          item: String(ing.item || ''),
          quantity: String(ing.quantity || ''),
          unit: String(ing.unit || '')
        })) : [],
        instructions: Array.isArray(recipe.instructions) ? recipe.instructions.map(String) : [],
        nutritional_info: {
          calories: Number(recipe?.nutritional_info?.calories || 0),
          protein: Number(recipe?.nutritional_info?.protein || 0),
          carbs: Number(recipe?.nutritional_info?.carbs || 0),
          fat: Number(recipe?.nutritional_info?.fat || 0)
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