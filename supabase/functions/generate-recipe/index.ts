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

    // Profil nutritionnel par défaut basé sur l'âge
    const nutritionProfile = {
      protein: childProfile.age <= 3 ? '15-18%' : '15-20%',
      carbs: childProfile.age <= 3 ? '45-55%' : '50-60%',
      fat: childProfile.age <= 3 ? '30-35%' : '20-30%'
    };

    const prompt = `En tant que chef cuisinier et pédiatre nutritionniste français, crée une recette exceptionnelle, gourmande et équilibrée ${mealTypePrompt} ${difficultyPrompt} ${timePrompt} pour un enfant de ${childProfile.age} ans.

    ${childProfile.allergies?.length > 0 ? `⚠️ IMPORTANT : Évite absolument ces allergènes : ${childProfile.allergies.join(', ')}` : ''}
    ${childProfile.preferences?.length > 0 ? `✨ Préférences alimentaires à inclure : ${childProfile.preferences.join(', ')}` : ''}
    
    La recette doit :
    1. 🧒 Être nutritionnellement adaptée à l'âge (${childProfile.age} ans) et ses besoins de croissance (calcium, fer, vitamines, etc.).
    2. 🍎 Promouvoir des ingrédients frais, variés, de saison et sains.
    3. 👩‍🍳 Être simple à préparer, sécurisée pour un enfant et amusante à réaliser avec un adulte.
    4. 🎨 Inclure des couleurs vibrantes et une présentation ludique pour capter l'attention de l'enfant.
    5. 🧠 Favoriser le développement cérébral et physique avec des superaliments adaptés (ex. : noix, graines, légumes verts, etc.).
    6. 💡 Avoir un nom créatif et amusant qui s'inspire des héros, des animaux, des personnages de dessins animés ou des peluches préférés des enfants (ex: "Le Sandwich du Super-Héros", "Les Nuggets du Petit Dragon", "La Soupe Magique de la Licorne", "Le Bol du Petit Tigre").
    7. 📋 Fournir des instructions claires et détaillées, avec des quantités exactes.
    8. 🌍 Incorporer des options écoresponsables (ex. : éviter le gaspillage alimentaire, utiliser des produits locaux).
    
    ⚖️ Assure-toi que la recette respecte les proportions idéales pour un repas enfantin sain :
    - Protéines : ${nutritionProfile.protein}
    - Glucides : ${nutritionProfile.carbs}
    - Lipides : ${nutritionProfile.fat}
    
    Réponds UNIQUEMENT avec un objet JSON valide et respecte EXACTEMENT cette structure :
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

    console.log('Sending request to OpenAI with prompt:', prompt);
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Tu es un chef cuisinier français créatif, passionné et reconnu pour tes compétences en pédiatrie nutritionnelle et diététique. Tu excelles dans la création de recettes amusantes, délicieuses, saines et adaptées aux besoins spécifiques des enfants. Réponds UNIQUEMENT avec le JSON demandé, sans aucun texte supplémentaire ni formatage.'
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

    if (!recipeContent.name || 
        !Array.isArray(recipeContent.ingredients) || 
        !Array.isArray(recipeContent.instructions) || 
        !recipeContent.nutritional_info) {
      console.error('Invalid recipe structure:', recipeContent);
      throw new Error('Structure de la recette invalide');
    }

    // Génération d'une image thématique adaptée aux enfants
    const themes = [
      'superhero themed food art',
      'disney character food plating',
      'pokemon inspired food decoration',
      'marvel heroes food art',
      'princess themed food presentation',
      'ninja turtle food design',
      'space explorer food art',
      'pirate treasure food plating',
      'magical wizard food decoration',
      'dinosaur shaped food art'
    ];
    
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    const searchQuery = `${encodeURIComponent(randomTheme)},${encodeURIComponent(recipeContent.name)}`;
    recipeContent.image_url = `https://source.unsplash.com/featured/?${searchQuery}&${Date.now()}`;

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