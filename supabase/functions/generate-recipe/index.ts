import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function retryWithDelay(fn: () => Promise<any>, maxRetries = 3, initialDelay = 1000) {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.error(`Tentative ${i + 1} échouée:`, error);
      
      if (error.message?.includes('Too Many Requests')) {
        const waitTime = initialDelay * Math.pow(2, i);
        console.log(`Attente de ${waitTime}ms avant nouvelle tentative...`);
        await delay(waitTime);
      } else {
        throw error;
      }
    }
  }
  throw lastError;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Pas d\'en-tête d\'autorisation');
    }

    const token = authHeader.replace('Bearer ', '');
    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    const userId = tokenPayload.sub;

    if (!openAIApiKey) {
      throw new Error('Clé API OpenAI non configurée. Veuillez configurer la variable OPENAI_API_KEY.');
    }

    const { childProfile } = await req.json();

    const prompt = `Génère une recette de petit-déjeuner saine adaptée à un enfant de ${childProfile.age} ans.
    ${childProfile.allergies?.length > 0 ? `Allergies à éviter : ${childProfile.allergies.join(', ')}` : ''}
    ${childProfile.preferences?.length > 0 ? `Préférences alimentaires : ${childProfile.preferences.join(', ')}` : ''}
    
    La recette doit être :
    1. Adaptée à l'âge
    2. Équilibrée nutritionnellement
    3. Facile à préparer
    4. Sûre en tenant compte des allergies
    5. Prenant en compte les préférences
    
    La réponse DOIT être un objet JSON valide avec EXACTEMENT cette structure :
    {
      "name": "Nom de la recette",
      "ingredients": [
        {"item": "nom ingrédient", "quantity": "quantité", "unit": "unité de mesure"}
      ],
      "instructions": ["étape 1", "étape 2", "etc"],
      "nutritional_info": {
        "calories": nombre,
        "protein": nombre,
        "carbs": nombre,
        "fat": nombre
      }
    }`;

    const generateRecipeWithOpenAI = async () => {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'Vous êtes un nutritionniste professionnel spécialisé dans les besoins alimentaires des enfants. Répondez uniquement en JSON valide, sans texte ni explications supplémentaires.'
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Erreur API OpenAI : ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data;
    };

    const data = await retryWithDelay(generateRecipeWithOpenAI);
    
    try {
      if (!data.choices?.[0]?.message?.content) {
        throw new Error('Structure de réponse OpenAI invalide');
      }

      const content = data.choices[0].message.content.trim();
      let recipeContent = JSON.parse(content);

      if (!recipeContent.name || 
          !Array.isArray(recipeContent.ingredients) || 
          !Array.isArray(recipeContent.instructions) || 
          !recipeContent.nutritional_info) {
        throw new Error('Les données de la recette sont manquantes ou ont des types invalides');
      }

      recipeContent.instructions = recipeContent.instructions.map(String);

      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const { data: recipe, error: insertError } = await supabaseClient
        .from('recipes')
        .insert({
          profile_id: userId,
          name: recipeContent.name,
          ingredients: recipeContent.ingredients,
          instructions: recipeContent.instructions,
          nutritional_info: recipeContent.nutritional_info,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      return new Response(JSON.stringify(recipe), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      throw new Error(`Échec de l'analyse ou de la validation des données de la recette : ${parseError.message}`);
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});