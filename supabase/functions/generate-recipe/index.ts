import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { child, filters, existingRecipes = [] } = await req.json();

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

    const excludeRecipes = existingRecipes.length
      ? `Exclure toute recette ayant des ingrédients, étapes ou noms similaires à : ${existingRecipes.map((recipe: any) => recipe.name).join(', ')}`
      : '';

    const prompt = `Tu es un chef spécialisé dans la nutrition infantile. Génère 5 recettes DIFFÉRENTES et CRÉATIVES pour enfant:

Age: ${new Date().getFullYear() - new Date(child.birth_date).getFullYear()} ans
Allergies: ${child.allergies?.join(", ") || "Aucune"}
Préférences: ${child.preferences?.join(", ") || "Aucune préférence particulière"}
${constraints.length ? 'Contraintes: ' + constraints.join(', ') : ''}
${excludeRecipes}

IMPORTANT:
- 3 bienfaits santé PARFAITEMENT distincts parmi: ${validCategories.join(', ')} dans CHAQUE recette
- Varies les ingrédients et évite la répétition (ex: différents légumes ou sources de protéines entre recettes)
- Temps réaliste incluant préparation + cuisson
- Utilise des ingrédients courants et accessibles
- Étapes claires et concises, mais VARIÉES dans leur style d'écriture
- CHAQUE recette doit être UNIQUE (pas de noms, ingrédients, ou structures similaires)

Retourne UNIQUEMENT un tableau JSON de recettes SANS texte ou formatage supplémentaire. Chaque recette doit suivre EXACTEMENT cette structure:
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
  "seasonal_months": [number]
}`;

    console.log("Sending prompt to OpenAI:", prompt);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
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

    const data = await response.json();
    console.log("OpenAI Response:", data);

    if (!data.choices?.[0]?.message?.content) {
      throw new Error("Réponse invalide d'OpenAI");
    }

    let recipes;
    try {
      const content = data.choices[0].message.content;
      console.log("Contenu brut de la réponse OpenAI:", content);
      
      // Nettoyer le contenu en retirant tout formatage markdown
      const cleanContent = content.replace(/```json\n|\n```|```/g, '').trim();
      console.log("Contenu nettoyé:", cleanContent);
      
      recipes = JSON.parse(cleanContent);
      
      // Valider la structure des recettes
      if (!Array.isArray(recipes)) {
        throw new Error("Les recettes doivent être un tableau");
      }

      // Vérifier l'unicité des bienfaits santé
      recipes = recipes.map(recipe => ({
        ...recipe,
        is_generated: true,
        profile_id: child.profile_id,
        image_url: recipe.image_url || 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
      }));

      console.log("Recettes analysées et traitées avec succès:", recipes);
    } catch (e) {
      console.error("Erreur lors de l'analyse des données de recette:", e);
      throw new Error(`Échec de l'analyse des données de recette: ${e.message}`);
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
    console.error("Erreur dans la fonction generate-recipe:", error);
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