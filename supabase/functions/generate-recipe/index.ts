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

    const { childProfile } = await req.json();

    const prompt = `Génère une recette de petit-déjeuner saine et amusante adaptée à un enfant de ${childProfile.age} ans.
    ${childProfile.allergies?.length > 0 ? `Allergies à éviter : ${childProfile.allergies.join(', ')}` : ''}
    ${childProfile.preferences?.length > 0 ? `Préférences alimentaires : ${childProfile.preferences.join(', ')}` : ''}
    
    La recette doit être :
    1. Adaptée à l'âge de l'enfant
    2. Équilibrée nutritionnellement
    3. Facile à préparer
    4. Sûre en tenant compte des allergies
    5. Amusante et attrayante pour l'enfant
    6. Avec un nom créatif et ludique
    7. Les instructions doivent inclure les quantités spécifiques, par exemple : "Verse 1 tasse de lait" au lieu de "Ajoute le lait"
    
    IMPORTANT: Réponds UNIQUEMENT avec un objet JSON valide, sans formatage markdown, sans backticks (\`\`\`), avec EXACTEMENT cette structure :
    {
      "name": "Nom créatif de la recette",
      "ingredients": [
        {"item": "nom ingrédient", "quantity": "quantité", "unit": "unité de mesure"}
      ],
      "instructions": ["étape 1 avec quantités", "étape 2 avec quantités", "etc"],
      "nutritional_info": {
        "calories": nombre,
        "protein": nombre,
        "carbs": nombre,
        "fat": nombre
      }
    }`;

    console.log('Sending request to OpenAI...');
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
            content: 'Tu es un chef cuisinier français spécialisé dans la création de recettes amusantes et saines pour les enfants. Réponds UNIQUEMENT avec le JSON demandé, sans aucun texte supplémentaire ni formatage.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
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

    recipeContent.instructions = recipeContent.instructions.map(String);
    recipeContent.ingredients = recipeContent.ingredients.map(ing => ({
      item: String(ing.item),
      quantity: String(ing.quantity),
      unit: String(ing.unit)
    }));

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