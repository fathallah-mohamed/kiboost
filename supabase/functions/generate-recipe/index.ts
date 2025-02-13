
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

    // Exemple simple et direct pour le modèle
    const baseRecipe = {
      name: "Recette de base",
      ingredients: [
        { item: "Ingrédient 1", quantity: "100", unit: "g" }
      ],
      instructions: ["Étape 1"],
      nutritional_info: { calories: 100, protein: 5, carbs: 20, fat: 2 },
      meal_type: filters.mealType || "dinner",
      preparation_time: filters.maxPrepTime || 30,
      difficulty: filters.difficulty || "medium",
      servings: 4,
      health_benefits: [
        { icon: "🧠", category: "cognitive", description: "Bénéfice santé" }
      ]
    };

    const prompt = `Génère exactement 3 recettes créatives adaptées aux enfants. Voici les détails:

Contexte:
- Enfant de ${childAge} ans
- Type de repas: ${filters.mealType || "dinner"}
- Temps de préparation maximum: ${filters.maxPrepTime || 30} minutes
- Difficulté: ${filters.difficulty || "medium"}
${child.allergies?.length ? `- Allergies à éviter: ${child.allergies.join(", ")}` : ""}

Exemple exact du format JSON attendu:
${JSON.stringify([baseRecipe], null, 2)}

IMPORTANT:
1. Retourne EXACTEMENT 3 recettes
2. Utilise STRICTEMENT le même format JSON que l'exemple
3. NE METS PAS de texte avant ou après le JSON
4. ÉVITE les caractères spéciaux dans les noms`;

    console.log("Sending prompt to Perplexity:", prompt);

    const perplexityKey = Deno.env.get('PERPLEXITY_API_KEY');
    if (!perplexityKey) {
      throw new Error('Perplexity API key is missing');
    }

    // Appel à Perplexity avec des paramètres optimisés
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
            content: 'Tu es un assistant qui génère UNIQUEMENT du JSON valide, sans texte ni formatage autour.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 0.95,
        frequency_penalty: 0.1  // On garde uniquement frequency_penalty
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Perplexity API error response:", errorText);
      throw new Error(`Erreur API Perplexity: ${errorText}`);
    }

    const responseText = await response.text();
    console.log("Raw Perplexity response:", responseText);

    let data;
    try {
      data = JSON.parse(responseText);
      console.log("Parsed Perplexity response data:", data);
    } catch (error) {
      console.error("Failed to parse Perplexity response:", error);
      throw new Error("Réponse invalide de Perplexity");
    }

    if (!data.choices?.[0]?.message?.content) {
      console.error("Invalid Perplexity response structure:", data);
      throw new Error("Structure de réponse Perplexity invalide");
    }

    let content = data.choices[0].message.content.trim();
    console.log("Raw content from Perplexity:", content);

    // Nettoyer le contenu pour extraire uniquement le JSON
    content = content.replace(/```json\s*([\s\S]*?)\s*```/g, '$1')
                    .replace(/^[^[]*(\[[\s\S]*\])[^]*$/, '$1')
                    .trim();
    
    console.log("Cleaned content:", content);

    let recipes;
    try {
      recipes = JSON.parse(content);
      console.log("Parsed recipes:", recipes);
    } catch (error) {
      console.error("Failed to parse recipes JSON:", error);
      console.error("Content that failed to parse:", content);
      throw new Error("La réponse n'est pas au format JSON valide");
    }

    if (!Array.isArray(recipes)) {
      console.error("Recipes is not an array:", recipes);
      throw new Error("Le format de réponse n'est pas un tableau");
    }

    if (recipes.length === 0) {
      console.error("No recipes generated");
      throw new Error("Aucune recette n'a été générée");
    }

    // Traiter et valider chaque recette
    const processedRecipes = recipes.map((recipe, index) => {
      if (!recipe.name) {
        console.warn(`Recipe ${index} has no name, using default`);
      }
      if (!Array.isArray(recipe.ingredients)) {
        console.warn(`Recipe ${index} has invalid ingredients, using empty array`);
      }
      if (!Array.isArray(recipe.instructions)) {
        console.warn(`Recipe ${index} has invalid instructions, using empty array`);
      }

      return {
        profile_id: child.profile_id,
        child_id: child.id,
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
        meal_type: filters.mealType || 'dinner',
        preparation_time: Number(filters.maxPrepTime) || 30,
        difficulty: filters.difficulty || 'medium',
        servings: Number(recipe.servings) || 4,
        is_generated: true,
        source: 'ia',
        auto_generated: true,
        health_benefits: Array.isArray(recipe.health_benefits) ? recipe.health_benefits.map(benefit => ({
          icon: String(benefit.icon || '🍳'),
          category: String(benefit.category || 'global'),
          description: String(benefit.description || '')
        })) : [],
        image_url: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
        min_age: childAge - 2,
        max_age: childAge + 2,
        dietary_preferences: child.preferences || [],
        allergens: child.allergies || [],
        cost_estimate: 0,
        seasonal_months: [1,2,3,4,5,6,7,8,9,10,11,12],
        cooking_steps: []
      };
    });

    console.log("Final processed recipes:", processedRecipes);

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
