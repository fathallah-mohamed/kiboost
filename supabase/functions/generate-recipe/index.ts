
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

    // Adapter les suggestions en fonction du type de repas
    const mealSuggestions = {
      breakfast: [
        "Porridge aux fruits",
        "Toast à l'avocat",
        "Pancakes aux légumes",
        "Smoothie bowl",
        "Oeufs brouillés",
        "Yaourt aux fruits",
        "Muesli maison",
        "Sandwich petit-déjeuner"
      ],
      lunch: [
        "Sandwich wrap",
        "Salade composée",
        "Pâtes aux légumes",
        "Bowl de quinoa",
        "Soupe repas",
        "Quiche légère"
      ],
      dinner: [
        "Gratin léger",
        "Poisson aux légumes",
        "Wok de légumes",
        "Omelette garnie",
        "Burger maison",
        "Pizza légère"
      ],
      snack: [
        "Smoothie fruité",
        "Muffin aux légumes",
        "Fruits découpés",
        "Barre de céréales",
        "Tartine gourmande"
      ]
    };

    const suggestedRecipes = mealSuggestions[filters.mealType as keyof typeof mealSuggestions] || 
                           mealSuggestions.dinner;

    const prompt = `Tu es un chef spécialisé en nutrition infantile. Je veux EXACTEMENT 3 recettes dans un format JSON VALIDE.

Informations importantes:
- Âge de l'enfant : ${childAge} ans
- Type de repas : ${filters.mealType || 'dinner'}
- Temps max : ${filters.maxPrepTime || '30'} minutes
- Difficulté : ${filters.difficulty || 'facile'}
- Allergies : ${child.allergies?.join(", ") || "aucune"}
- Préférences : ${child.preferences?.join(", ") || "aucune"}

Voici des suggestions de recettes à adapter : ${suggestedRecipes.join(", ")}

⚠️ RÈGLES ABSOLUES :
1. Je veux EXACTEMENT 3 recettes DIFFÉRENTES
2. Format JSON strict : uniquement le tableau JSON, pas de texte autour
3. Temps de préparation : maximum ${filters.maxPrepTime || 30} minutes
4. Adapter les portions pour ${childAge} ans
5. Ingrédients faciles à trouver
6. Instructions simples et claires

Format JSON STRICT à respecter :
[
  {
    "name": "Nom unique de la recette",
    "ingredients": [
      {"item": "Ingrédient 1", "quantity": "100", "unit": "g"}
    ],
    "instructions": ["Étape 1", "Étape 2"],
    "nutritional_info": {"calories": 100, "protein": 5, "carbs": 20, "fat": 2},
    "meal_type": "${filters.mealType || 'dinner'}",
    "preparation_time": ${filters.maxPrepTime || 15},
    "difficulty": "${filters.difficulty || 'medium'}",
    "servings": 4,
    "health_benefits": [
      {"icon": "🧠", "category": "cognitive", "description": "Bénéfice santé"}
    ]
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
            content: 'Tu es un assistant qui génère UNIQUEMENT du JSON valide. Tu ne dois jamais ajouter de texte ou de markdown autour du JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 1000,
        return_images: false,
        return_related_questions: false,
        search_domain_filter: ['perplexity.ai'],
        search_recency_filter: 'month',
        frequency_penalty: 1,
        presence_penalty: 0
      }),
    });

    const responseText = await response.text();
    console.log("Raw Perplexity response:", responseText);

    if (!response.ok) {
      let errorMessage = "Erreur de l'API Perplexity";
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.error?.message?.includes("insufficient_quota")) {
          errorMessage = "Le quota Perplexity est insuffisant. Veuillez mettre à jour votre abonnement.";
          console.error("Perplexity quota insufficient:", errorData);
        } else {
          console.error("Perplexity API error:", errorData);
        }
      } catch (e) {
        console.error("Error parsing Perplexity error response:", e);
      }
      throw new Error(errorMessage);
    }

    const data = JSON.parse(responseText);
    console.log("Parsed Perplexity Response:", data);

    if (!data.choices?.[0]?.message?.content) {
      throw new Error("Réponse invalide de Perplexity");
    }

    try {
      let content = data.choices[0].message.content.trim();
      console.log("Content before cleaning:", content);
      
      // Nettoyer le contenu pour s'assurer qu'il commence et se termine par des crochets
      content = content.replace(/^[^[]*(\[.*\])[^]*$/s, '$1');
      console.log("Cleaned content:", content);
      
      let recipes;
      try {
        recipes = JSON.parse(content);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        console.error("Invalid JSON content:", content);
        throw new Error(`Impossible de parser le JSON: ${parseError.message}`);
      }
      
      if (!Array.isArray(recipes)) {
        throw new Error("Le format de réponse n'est pas un tableau");
      }

      if (recipes.length !== 3) {
        throw new Error(`Nombre de recettes incorrect: ${recipes.length} (attendu: 3)`);
      }

      const processedRecipes = recipes.map(recipe => {
        if (!recipe.name || typeof recipe.name !== 'string') {
          throw new Error("Une recette n'a pas de nom valide");
        }

        if (!Array.isArray(recipe.ingredients)) {
          throw new Error(`Les ingrédients de "${recipe.name}" ne sont pas dans un format valide`);
        }

        if (!Array.isArray(recipe.instructions)) {
          throw new Error(`Les instructions de "${recipe.name}" ne sont pas dans un format valide`);
        }

        return {
          profile_id: child.profile_id,
          child_id: child.id,
          name: String(recipe.name),
          ingredients: recipe.ingredients.map(ing => ({
            item: String(ing.item || ''),
            quantity: String(ing.quantity || ''),
            unit: String(ing.unit || '')
          })),
          instructions: recipe.instructions.map(String),
          nutritional_info: {
            calories: Number(recipe.nutritional_info?.calories || 0),
            protein: Number(recipe.nutritional_info?.protein || 0),
            carbs: Number(recipe.nutritional_info?.carbs || 0),
            fat: Number(recipe.nutritional_info?.fat || 0)
          },
          meal_type: recipe.meal_type || filters.mealType || 'dinner',
          preparation_time: Number(recipe.preparation_time) || filters.maxPrepTime || 30,
          max_prep_time: Number(filters.maxPrepTime) || 30,
          difficulty: recipe.difficulty || filters.difficulty || 'medium',
          servings: Number(recipe.servings) || 4,
          is_generated: true,
          source: 'ia',
          auto_generated: true,
          health_benefits: (recipe.health_benefits || []).map(benefit => ({
            icon: String(benefit.icon || '🍳'),
            category: benefit.category || 'global',
            description: String(benefit.description || '')
          })),
          image_url: recipe.image_url || 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
          min_age: childAge - 2,
          max_age: childAge + 2,
          dietary_preferences: child.preferences || [],
          allergens: child.allergies || [],
          cost_estimate: Number(recipe.cost_estimate) || 0,
          seasonal_months: recipe.seasonal_months || [1,2,3,4,5,6,7,8,9,10,11,12],
          cooking_steps: recipe.cooking_steps || []
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
