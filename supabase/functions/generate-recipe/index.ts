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

    const { childProfile, filters, excludeRecipes } = await req.json();

    const mealTypePrompt = filters?.mealType ? `pour le ${filters.mealType}` : 'pour n\'importe quel repas';
    const difficultyPrompt = filters?.difficulty ? `de difficulté ${filters.difficulty}` : '';
    const timePrompt = filters?.maxPrepTime ? `qui se prépare en moins de ${filters.maxPrepTime} minutes` : '';

    const prompt = `En tant que chef cuisinier français créatif, crée une recette unique et amusante ${mealTypePrompt} ${difficultyPrompt} ${timePrompt} pour un enfant de ${childProfile.age} ans.

    ${childProfile.allergies?.length > 0 ? `⚠️ IMPORTANT: Évite absolument ces allergènes : ${childProfile.allergies.join(', ')}` : ''}
    ${childProfile.preferences?.length > 0 ? `✨ Préférences alimentaires à favoriser : ${childProfile.preferences.join(', ')}` : ''}
    
    La recette doit être :
    1. 👶 Parfaitement adaptée à l'âge de l'enfant (${childProfile.age} ans)
    2. 🥗 Équilibrée nutritionnellement
    3. 👨‍🍳 Facile et sécurisée à préparer avec un adulte
    4. 🎨 Colorée et visuellement attrayante
    5. 🎯 Avec un nom créatif et amusant qui donne envie à l'enfant
    6. 📝 Instructions détaillées avec des quantités précises
    7. 🌈 Utilisant des ingrédients variés et de saison
    
    IMPORTANT: Réponds UNIQUEMENT avec un objet JSON valide, sans formatage markdown, sans backticks (\`\`\`), avec EXACTEMENT cette structure :
    {
      "name": "Nom créatif et amusant de la recette",
      "ingredients": [
        {"item": "nom ingrédient", "quantity": "quantité précise", "unit": "unité de mesure"}
      ],
      "instructions": ["étape 1 détaillée", "étape 2 détaillée", "etc"],
      "nutritional_info": {
        "calories": nombre,
        "protein": nombre,
        "carbs": nombre,
        "fat": nombre
      },
      "meal_type": "${filters?.mealType || 'dinner'}",
      "preparation_time": nombre (en minutes),
      "difficulty": "${filters?.difficulty || 'medium'}",
      "servings": 4
    }`;

    console.log('Sending request to OpenAI...');
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
            content: 'Tu es un chef cuisinier français créatif, spécialisé dans la création de recettes amusantes, saines et adaptées aux enfants. Réponds UNIQUEMENT avec le JSON demandé, sans aucun texte supplémentaire ni formatage.'
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
    let recipeContent;
    try {
      recipeContent = JSON.parse(content);
    } catch (error) {
      console.error('JSON parse error:', error);
      throw new Error(`Échec du parsing JSON : ${error.message}`);
    }

    // Vérification de la structure de la recette
    if (!recipeContent.name || 
        !Array.isArray(recipeContent.ingredients) || 
        !Array.isArray(recipeContent.instructions) || 
        !recipeContent.nutritional_info) {
      console.error('Invalid recipe structure:', recipeContent);
      throw new Error('Structure de la recette invalide');
    }

    // Génération d'une image aléatoire parmi plusieurs thèmes
    const themes = [
      'colorful food photography',
      'healthy meal plating',
      'kids food art',
      'creative food presentation',
      'appetizing food styling'
    ];
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    recipeContent.image_url = `https://source.unsplash.com/featured/?${encodeURIComponent(randomTheme)},${encodeURIComponent(recipeContent.name)}`;

    return new Response(JSON.stringify(recipeContent), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-recipe function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});