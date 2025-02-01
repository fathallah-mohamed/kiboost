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

    const childAge = new Date().getFullYear() - new Date(child.birth_date).getFullYear();
    const isBreakfast = filters?.mealType === 'breakfast';
    const isQuick = (filters?.maxPrepTime || 30) <= 15;
    const isEasy = filters?.difficulty === 'easy';

    // Adapt the prompt based on the filters
    let basePrompt = `Tu es un chef expert en nutrition infantile spécialisé dans la création de recettes ${isBreakfast ? 'de petit-déjeuner' : ''} ${isQuick ? 'rapides' : ''} ${isEasy ? 'et faciles' : ''} pour les enfants.`;

    // For breakfast recipes, add specific constraints
    const breakfastConstraints = isBreakfast ? `
🔹 **Contraintes spécifiques petit-déjeuner:**
- Recettes UNIQUEMENT pour le petit-déjeuner
- Temps de préparation: STRICTEMENT moins de 15 minutes
- Difficulté: UNIQUEMENT facile
- Ingrédients: Utiliser des ingrédients courants du petit-déjeuner
- Énergie: Fournir l'énergie nécessaire pour la matinée
` : '';

    const prompt = `${basePrompt}

🔹 **Profil de l'enfant:**
- Âge: ${childAge} ans
- Allergies: ${child.allergies?.length ? child.allergies.join(", ") : "Aucune"}
- Préférences: ${child.preferences?.length ? child.preferences.join(", ") : "Aucune préférence"}

${breakfastConstraints}

🔹 **Critères stricts:**
- Type de repas: ${filters.mealType}
- Temps maximum: ${filters.maxPrepTime}min
- Difficulté: ${filters.difficulty}

⚠️ IMPORTANT: Génère TOUJOURS au moins 3 recettes, même si certaines contraintes sont difficiles. Adapte les recettes plutôt que de ne rien renvoyer.

Retourne UNIQUEMENT un tableau JSON avec ce format STRICT:
{
  "name": "Nom descriptif",
  "ingredients": [{"item": "Ingrédient", "quantity": "Valeur", "unit": "Unité"}],
  "instructions": ["Étape 1", "Étape 2"],
  "nutritional_info": {"calories": 0, "protein": 0, "carbs": 0, "fat": 0},
  "meal_type": "${filters.mealType}",
  "preparation_time": ${Math.min(filters.maxPrepTime || 30, 15)},
  "difficulty": "${filters.difficulty}",
  "servings": 1,
  "health_benefits": [
    {"icon": "emoji", "category": "catégorie", "description": "description"}
  ]
}`;

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
            content: "Tu es un chef expert qui génère UNIQUEMENT du JSON valide, sans texte ni markdown."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 2000,
        presence_penalty: 0.4,
        frequency_penalty: 0.4
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
        .replace(/,\s*\]/g, ']')
        .replace(/\s+/g, ' ');
      
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
        meal_type: filters.mealType,
        preparation_time: Math.min(Number(recipe?.preparation_time || 15), filters.maxPrepTime || 30),
        difficulty: filters.difficulty,
        health_benefits: Array.isArray(recipe.health_benefits) ? recipe.health_benefits.map(benefit => ({
          icon: String(benefit.icon || '🍳'),
          category: String(benefit.category || 'energy'),
          description: String(benefit.description || 'Apporte de l\'énergie')
        })) : []
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