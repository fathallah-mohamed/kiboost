import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Pas d\'en-tête d\'autorisation');
    }

    if (!openAIApiKey) {
      throw new Error('Clé API OpenAI non configurée');
    }

    const { childProfiles, filters } = await req.json();
    console.log('Received request with child profiles:', childProfiles);
    console.log('Filters:', filters);

    // Combiner les allergies et préférences
    const allAllergies = [...new Set(childProfiles.flatMap(child => child.allergies))];
    const commonPreferences = childProfiles.reduce((common, child) => {
      if (common.length === 0) return child.preferences;
      return common.filter(pref => child.preferences.includes(pref));
    }, []);

    const ageRange = {
      min: Math.min(...childProfiles.map(child => child.age)),
      max: Math.max(...childProfiles.map(child => child.age))
    };

    const mealTypePrompt = filters?.mealType ? `pour le ${filters.mealType}` : 'pour n\'importe quel repas';
    const difficultyPrompt = filters?.difficulty ? `de difficulté ${filters.difficulty}` : '';
    const timePrompt = filters?.maxPrepTime ? `qui se prépare en moins de ${filters.maxPrepTime} minutes` : '';

    const prompt = `En tant que chef cuisinier et pédiatre nutritionniste français, crée 9 recettes exceptionnelles, gourmandes et équilibrées ${mealTypePrompt} ${difficultyPrompt} ${timePrompt} pour ${childProfiles.length} enfant(s) âgés de ${ageRange.min} à ${ageRange.max} ans.

    ${allAllergies.length > 0 ? `⚠️ TRÈS IMPORTANT - ALLERGIES : Évite absolument ces allergènes pour TOUS les enfants : ${allAllergies.join(', ')}` : ''}
    ${commonPreferences.length > 0 ? `✨ PRÉFÉRENCES COMMUNES : Privilégie ces ingrédients appréciés par TOUS les enfants : ${commonPreferences.join(', ')}` : ''}
    
    Chaque recette doit :
    1. 🧒 Être nutritionnellement adaptée à la tranche d'âge (${ageRange.min}-${ageRange.max} ans)
    2. 🍎 Promouvoir des ingrédients frais et sains
    3. 👩‍🍳 Être simple à préparer
    4. 🎨 Avoir une présentation ludique
    5. 🧠 Favoriser le développement avec des superaliments adaptés
    6. 💡 Avoir un nom créatif et amusant
    7. 📋 Fournir des instructions claires
    8. 🌍 Incorporer des options écoresponsables
    9. 👥 Être adaptée pour TOUS les enfants sélectionnés

    TRÈS IMPORTANT : Pour chaque recette, tu dois ABSOLUMENT fournir une liste de 3 à 5 bienfaits santé spécifiques parmi ces catégories :
    - cognitive: bienfaits pour le cerveau et la concentration
    - energy: apport en énergie et vitalité
    - satiety: satiété et contrôle de l'appétit
    - digestive: santé digestive
    - immunity: renforcement du système immunitaire
    - growth: croissance et développement
    - mental: bien-être mental et émotionnel
    - organs: santé des organes
    - beauty: santé de la peau et des cheveux
    - physical: force et endurance physique
    - prevention: prévention des maladies
    - global: santé globale

    Pour chaque bienfait, fournis :
    - category: la catégorie (parmi la liste ci-dessus)
    - description: une description courte et ludique du bienfait
    - icon: une icône parmi : brain, zap, cookie, shield, leaf, lightbulb, battery, apple, heart, sun, dumbbell, sparkles
    
    Réponds UNIQUEMENT avec un tableau JSON de 9 recettes, chacune ayant cette structure :
    {
      "name": "Nom créatif de la recette",
      "ingredients": [
        {"item": "ingrédient", "quantity": "quantité", "unit": "unité"}
      ],
      "instructions": ["étape 1", "étape 2", "etc"],
      "nutritional_info": {
        "calories": nombre,
        "protein": nombre,
        "carbs": nombre,
        "fat": nombre
      },
      "health_benefits": [
        {
          "category": "catégorie",
          "description": "description du bienfait",
          "icon": "nom de l'icône"
        }
      ],
      "meal_type": "${filters?.mealType || 'dinner'}",
      "preparation_time": nombre,
      "difficulty": "${filters?.difficulty || 'medium'}",
      "servings": 4
    }`;

    console.log('Sending request to OpenAI with prompt:', prompt);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Tu es un chef cuisinier français créatif, passionné et reconnu pour tes compétences en pédiatrie nutritionnelle. Réponds UNIQUEMENT avec le JSON demandé, sans aucun texte supplémentaire.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.9,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error(`Erreur API OpenAI : ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    console.log('OpenAI response received:', data);
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Structure de réponse OpenAI invalide');
    }

    let content = data.choices[0].message.content.trim();
    if (content.startsWith('```')) {
      content = content.replace(/```json\n?/, '').replace(/```\n?$/, '');
    }

    console.log('Parsing JSON response:', content);
    let recipes;
    try {
      recipes = JSON.parse(content);
    } catch (error) {
      console.error('JSON parse error:', error);
      throw new Error(`Échec du parsing JSON : ${error.message}`);
    }

    if (!Array.isArray(recipes)) {
      console.error('Invalid recipes structure:', recipes);
      throw new Error('Structure des recettes invalide');
    }

    // Add generated flag and timestamps to each recipe
    const processedRecipes = recipes.map(recipe => ({
      ...recipe,
      is_generated: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profile_id: childProfiles[0].profile_id,
    }));

    return new Response(JSON.stringify(processedRecipes), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-recipe function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: "Une erreur est survenue lors de la génération des recettes. Veuillez réessayer."
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});