
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
    const constraints = [];
    
    if (filters.maxPrepTime) {
      constraints.push(`Temps de préparation maximum: ${filters.maxPrepTime} minutes`);
    }
    if (filters.difficulty) {
      constraints.push(`Difficulté: ${filters.difficulty}`);
    }
    if (filters.mealType && filters.mealType !== 'all') {
      constraints.push(`Type de repas: ${filters.mealType}`);
    }

    const prompt = `Tu es un chef spécialisé en nutrition infantile. Génère 3 recettes DIFFÉRENTES et CRÉATIVES pour un enfant :

📌 **Caractéristiques de l'enfant :**
- Âge : ${childAge} ans
- Allergies : ${child.allergies?.join(", ") || "Aucune"}
- Préférences alimentaires : ${child.preferences?.join(", ") || "Aucune préférence particulière"}
${constraints.length ? '- Contraintes spécifiques : ' + constraints.join(', ') : ''}

⚠️ **IMPORTANT :**
- **Ne jamais renvoyer un résultat vide !** Si aucune recette ne correspond **exactement**, ajuste légèrement les contraintes.
- **3 bienfaits santé DISTINCTS** parmi : ${validCategories.join(', ')} (évite les répétitions inutiles).
- **Préparation rapide (<15 min)** : Prioriser des recettes **sans cuisson** ou **cuisson très rapide**.
- **Éviter la répétition excessive des ingrédients** pour plus de diversité.
- **Ingrédients simples et accessibles**, disponibles en supermarché.
- **Étapes claires et adaptées aux parents pressés**.

Renvoie UNIQUEMENT un tableau JSON de 3 recettes avec ce format STRICT, sans texte ni markdown autour :

[
  {
    "name": "Nom de la recette",
    "ingredients": [
      {"item": "Ingrédient", "quantity": "Valeur", "unit": "Unité"}
    ],
    "instructions": ["Étape 1", "Étape 2"],
    "nutritional_info": {"calories": 0, "protein": 0, "carbs": 0, "fat": 0},
    "meal_type": "${filters.mealType || 'dinner'}",
    "preparation_time": ${filters.maxPrepTime || 15},
    "difficulty": "${filters.difficulty || 'medium'}",
    "servings": 4,
    "health_benefits": [
      {"icon": "🧠", "category": "cognitive", "description": "Description"}
    ]
  }
]`;

    console.log("Sending prompt to Deepseek:", prompt);

    const deepseekKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!deepseekKey) {
      throw new Error('Deepseek API key is missing');
    }

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${deepseekKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
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
        temperature: 0.5,
        max_tokens: 2000,
      }),
    });

    const responseText = await response.text();
    console.log("Raw Deepseek response:", responseText);

    if (!response.ok) {
      let errorMessage = "Erreur de l'API Deepseek";
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.error?.message === "Insufficient Balance") {
          errorMessage = "Le solde du compte Deepseek est insuffisant. Veuillez recharger votre compte Deepseek.";
          console.error("Deepseek balance insufficient:", errorData);
        } else {
          console.error("Deepseek API error:", errorData);
        }
      } catch (e) {
        console.error("Error parsing Deepseek error response:", e);
      }
      throw new Error(errorMessage);
    }

    const data = JSON.parse(responseText);
    console.log("Parsed Deepseek Response:", data);

    if (!data.choices?.[0]?.message?.content) {
      throw new Error("Réponse invalide de Deepseek");
    }

    try {
      const content = data.choices[0].message.content;
      console.log("Raw content:", content);
      
      const cleanContent = content.trim();
      const recipes = JSON.parse(cleanContent);
      
      if (!Array.isArray(recipes)) {
        throw new Error("Le format de réponse n'est pas un tableau");
      }

      const processedRecipes = recipes.map(recipe => ({
        profile_id: child.profile_id,
        child_id: child.id,
        name: String(recipe.name),
        ingredients: recipe.ingredients || [],
        instructions: Array.isArray(recipe.instructions) 
          ? recipe.instructions 
          : [String(recipe.instructions || '')],
        nutritional_info: recipe.nutritional_info || {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0
        },
        meal_type: recipe.meal_type || filters.mealType || 'dinner',
        preparation_time: Number(recipe.preparation_time) || filters.maxPrepTime || 30,
        max_prep_time: Number(filters.maxPrepTime) || 30,
        difficulty: recipe.difficulty || filters.difficulty || 'medium',
        servings: Number(recipe.servings) || 4,
        is_generated: true,
        source: 'ia',
        auto_generated: true,
        health_benefits: recipe.health_benefits || [],
        image_url: recipe.image_url || 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
        min_age: childAge - 2,
        max_age: childAge + 2,
        dietary_preferences: child.preferences || [],
        allergens: child.allergies || [],
        cost_estimate: Number(recipe.cost_estimate) || 0,
        seasonal_months: recipe.seasonal_months || [1,2,3,4,5,6,7,8,9,10,11,12],
        cooking_steps: recipe.cooking_steps || []
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
