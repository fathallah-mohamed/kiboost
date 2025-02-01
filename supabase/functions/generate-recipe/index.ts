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
    const mealType = filters?.mealType || 'dinner';
    const maxPrepTime = filters?.maxPrepTime || 30;
    const difficulty = filters?.difficulty || 'medium';

    const prompt = `Tu es un chef expert en nutrition infantile. Génère UNIQUEMENT un tableau JSON de 3 recettes UNIQUES avec ce format STRICT:

[
  {
    "name": "Nom de la recette",
    "ingredients": [
      {"item": "Ingrédient", "quantity": "Valeur", "unit": "Unité"}
    ],
    "instructions": ["Étape 1", "Étape 2"],
    "nutritional_info": {"calories": 0, "protein": 0, "carbs": 0, "fat": 0},
    "meal_type": "${mealType}",
    "preparation_time": ${maxPrepTime},
    "difficulty": "${difficulty}",
    "servings": 4,
    "health_benefits": [
      {"icon": "🍳", "category": "energy", "description": "Description"}
    ]
  }
]

🔹 Profil enfant:
- Âge: ${childAge} ans
- Allergies: ${child.allergies?.length ? child.allergies.join(", ") : "Aucune"}
- Préférences: ${child.preferences?.length ? child.preferences.join(", ") : "Aucune"}

⚠️ IMPORTANT:
- Génère EXACTEMENT 3 recettes DIFFÉRENTES
- RESPECTE le format JSON fourni
- Temps max: ${maxPrepTime}min
- Difficulté: ${difficulty}
- Ingrédients simples et adaptés
- Adapté à l'âge: ${childAge} ans
- CHAQUE recette doit être UNIQUE avec des ingrédients principaux différents`;

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
            content: "Tu es un chef qui génère UNIQUEMENT du JSON valide, sans texte ni markdown. Chaque recette doit être unique et différente des autres."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 1500,
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
      console.log("Raw content:", content);
      
      const cleanContent = content.trim();
      recipes = JSON.parse(cleanContent);
      
      if (!Array.isArray(recipes)) {
        throw new Error("Le format de réponse n'est pas un tableau");
      }

      // Transformation et validation des recettes
      const processedRecipes = recipes.map(recipe => {
        // Validation des champs requis
        if (!recipe.name || !Array.isArray(recipe.ingredients)) {
          throw new Error("Format de recette invalide");
        }

        // S'assurer que les ingrédients sont au bon format
        const ingredients = recipe.ingredients.map(ing => ({
          item: String(ing.item || ''),
          quantity: String(ing.quantity || ''),
          unit: String(ing.unit || '')
        }));

        // S'assurer que les instructions sont un tableau
        const instructions = Array.isArray(recipe.instructions) 
          ? recipe.instructions.map(String)
          : [String(recipe.instructions || '')];

        // Créer l'objet recette avec tous les champs correctement formatés
        return {
          name: String(recipe.name),
          ingredients: JSON.stringify(ingredients), // Convertir en chaîne JSON
          instructions: instructions.join('\n'), // Convertir en chaîne avec sauts de ligne
          nutritional_info: JSON.stringify({
            calories: Number(recipe?.nutritional_info?.calories || 0),
            protein: Number(recipe?.nutritional_info?.protein || 0),
            carbs: Number(recipe?.nutritional_info?.carbs || 0),
            fat: Number(recipe?.nutritional_info?.fat || 0)
          }),
          meal_type: mealType,
          preparation_time: Math.min(Number(recipe?.preparation_time || 30), maxPrepTime),
          max_prep_time: maxPrepTime,
          difficulty: difficulty,
          servings: Number(recipe?.servings || 4),
          health_benefits: JSON.stringify(
            Array.isArray(recipe.health_benefits) ? recipe.health_benefits : []
          ),
          min_age: childAge - 2,
          max_age: childAge + 2,
          dietary_preferences: child.preferences || [],
          allergens: child.allergies || [],
          cost_estimate: 0,
          seasonal_months: [1,2,3,4,5,6,7,8,9,10,11,12],
          cooking_steps: JSON.stringify([]),
          is_generated: true,
          profile_id: child.profile_id,
          child_id: child.id,
          source: 'ia',
          auto_generated: true
        };
      });

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
      console.error("Error processing recipe data:", error);
      throw new Error(`Failed to process recipe data: ${error.message}`);
    }

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