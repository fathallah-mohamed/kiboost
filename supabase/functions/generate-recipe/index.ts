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

    console.log("Generating recipes for child:", child);
    console.log("Using filters:", filters);

    const validCategories = [
      'cognitive', 'energy', 'satiety', 'digestive', 'immunity',
      'growth', 'mental', 'organs', 'beauty', 'physical',
      'prevention', 'global'
    ];

    let constraints = [];
    if (filters.mealType && filters.mealType !== 'all') {
      constraints.push(`Type de repas : ${filters.mealType}`);
    }
    if (filters.maxPrepTime) {
      constraints.push(`Temps maximum : ${filters.maxPrepTime}min`);
    }
    if (filters.difficulty && filters.difficulty !== 'all') {
      constraints.push(`Difficulté : ${filters.difficulty}`);
    }

    const prompt = `Tu es un chef spécialisé dans la nutrition infantile. Génère 3 recettes DIFFÉRENTES et CRÉATIVES pour enfant:

Age: ${new Date().getFullYear() - new Date(child.birth_date).getFullYear()} ans
Allergies: ${child.allergies?.join(", ") || "Aucune"}
Préférences: ${child.preferences?.join(", ") || "Aucune préférence particulière"}
${constraints.length ? 'Contraintes: ' + constraints.join(', ') : ''}

IMPORTANT:
- 3 bienfaits santé PARFAITEMENT distincts parmi: ${validCategories.join(', ')} dans CHAQUE recette
- Varies les ingrédients et évite la répétition
- Temps réaliste incluant préparation + cuisson
- Utilise des ingrédients courants et accessibles
- Étapes claires et concises
- CHAQUE recette doit être UNIQUE

Retourne UNIQUEMENT un tableau JSON de recettes avec cette structure:
{
  "name": "string",
  "ingredients": [{"item": "string", "quantity": "string", "unit": "string"}],
  "instructions": ["string"],
  "nutritional_info": {"calories": number, "protein": number, "carbs": number, "fat": number},
  "meal_type": "breakfast" | "lunch" | "dinner" | "snack",
  "preparation_time": number,
  "difficulty": "easy" | "medium" | "hard",
  "servings": number,
  "health_benefits": [{"icon": "string", "category": "string", "description": "string"}],
  "min_age": number,
  "max_age": number,
  "dietary_preferences": ["string"],
  "allergens": ["string"],
  "cost_estimate": number,
  "seasonal_months": [number],
  "cooking_steps": [{"step": number, "description": "string", "duration": number, "tips": "string"}]
}`;

    console.log("Sending prompt to OpenAI:", prompt);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
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
      
      const cleanContent = content.replace(/```json\n|\n```|```/g, '').trim();
      console.log("Cleaned content:", cleanContent);
      
      recipes = JSON.parse(cleanContent);
      
      if (!Array.isArray(recipes)) {
        recipes = [recipes];
      }

      recipes = recipes.map(recipe => ({
        ...recipe,
        profile_id: child.profile_id,
        child_id: child.id,
        source: 'ia',
        image_url: recipe.image_url || 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
        is_generated: true,
        auto_generated: true
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
      JSON.stringify({ error: error.message }),
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