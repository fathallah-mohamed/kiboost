import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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
    const isBreakfast = filters?.mealType === 'breakfast';
    const isQuick = (filters?.maxPrepTime || 30) <= 15;
    const isEasy = filters?.difficulty === 'easy';

    // Adapt the prompt based on meal type
    const mealTypePrompts = {
      breakfast: `
🔹 **Contraintes petit-déjeuner:**
- Recettes UNIQUEMENT pour le petit-déjeuner
- Temps de préparation: STRICTEMENT moins de ${filters.maxPrepTime || 15} minutes
- Difficulté: ${filters.difficulty || 'facile'}
- Ingrédients: Utiliser des ingrédients courants du petit-déjeuner
- Énergie: Fournir l'énergie nécessaire pour la matinée`,
      lunch: `
🔹 **Contraintes déjeuner:**
- Recettes UNIQUEMENT pour le déjeuner
- Temps de préparation: STRICTEMENT moins de ${filters.maxPrepTime || 30} minutes
- Difficulté: ${filters.difficulty || 'medium'}
- Équilibre: Protéines, légumes et féculents
- Adapté pour une lunch box si nécessaire`,
      dinner: `
🔹 **Contraintes dîner:**
- Recettes UNIQUEMENT pour le dîner
- Temps de préparation: STRICTEMENT moins de ${filters.maxPrepTime || 30} minutes
- Difficulté: ${filters.difficulty || 'medium'}
- Repas léger mais nutritif
- Favoriser la digestion pour la nuit`,
      snack: `
🔹 **Contraintes goûter:**
- Recettes UNIQUEMENT pour le goûter
- Temps de préparation: STRICTEMENT moins de ${filters.maxPrepTime || 15} minutes
- Difficulté: ${filters.difficulty || 'easy'}
- Collation équilibrée et énergétique
- Limiter le sucre tout en restant gourmand`
    };

    const mealTypePrompt = mealTypePrompts[filters.mealType as keyof typeof mealTypePrompts] || mealTypePrompts.dinner;

    const prompt = `Tu es un chef expert en nutrition infantile. Génère UNIQUEMENT un tableau JSON de 3 recettes avec ce format STRICT:

[
  {
    "name": "Nom de la recette",
    "ingredients": [
      {"item": "Ingrédient", "quantity": "Valeur", "unit": "Unité"}
    ],
    "instructions": ["Étape 1", "Étape 2"],
    "nutritional_info": {"calories": 0, "protein": 0, "carbs": 0, "fat": 0},
    "meal_type": "${filters.mealType}",
    "preparation_time": ${Math.min(filters.maxPrepTime || 30, 15)},
    "difficulty": "${filters.difficulty}",
    "servings": 1,
    "health_benefits": [
      {"icon": "🍳", "category": "energy", "description": "Description"}
    ]
  }
]

🔹 Profil enfant:
- Âge: ${childAge} ans
- Allergies: ${child.allergies?.length ? child.allergies.join(", ") : "Aucune"}
- Préférences: ${child.preferences?.length ? child.preferences.join(", ") : "Aucune"}

${mealTypePrompt}

⚠️ IMPORTANT: 
- Génère EXACTEMENT 3 recettes
- RESPECTE le format JSON fourni
- Temps max: ${filters.maxPrepTime}min
- Difficulté: ${filters.difficulty}
- Ingrédients simples
- Adapté à l'âge: ${childAge} ans`;

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
            content: "Tu es un chef qui génère UNIQUEMENT du JSON valide, sans texte ni markdown."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
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
      
      // Clean the content to ensure valid JSON
      const cleanContent = content
        .replace(/```json\n?|\n?```/g, '') // Remove markdown code blocks
        .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width spaces
        .replace(/\n/g, ' ') // Remove newlines
        .trim();
      
      console.log("Cleaned content:", cleanContent);
      
      recipes = JSON.parse(cleanContent);
      
      if (!Array.isArray(recipes)) {
        recipes = [recipes];
      }

      // Validate and transform recipes
      recipes = recipes.map(recipe => ({
        ...recipe,
        ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
        instructions: Array.isArray(recipe.instructions) ? recipe.instructions : [],
        nutritional_info: {
          calories: Number(recipe?.nutritional_info?.calories || 0),
          protein: Number(recipe?.nutritional_info?.protein || 0),
          carbs: Number(recipe?.nutritional_info?.carbs || 0),
          fat: Number(recipe?.nutritional_info?.fat || 0)
        },
        meal_type: filters.mealType,
        preparation_time: Math.min(Number(recipe?.preparation_time || 15), filters.maxPrepTime || 30),
        difficulty: filters.difficulty,
        health_benefits: Array.isArray(recipe.health_benefits) ? recipe.health_benefits : []
      }));

      console.log("Processed recipes:", recipes);
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