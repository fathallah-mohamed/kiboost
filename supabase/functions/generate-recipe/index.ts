import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.2.1';

interface ChildProfile {
  id: string;
  name: string;
  birth_date: string;
  allergies: string[];
  preferences: string[];
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const generatePrompt = (child: ChildProfile) => {
  const allergiesText = child.allergies?.length > 0 
    ? `Allergies à éviter : ${child.allergies.join(', ')}`
    : 'Aucune allergie connue';
    
  const preferencesText = child.preferences?.length > 0
    ? `Préférences alimentaires : ${child.preferences.join(', ')}`
    : 'Aucune préférence particulière';

  return `Génère 3 recettes pour enfants avec les caractéristiques suivantes :

Profil de l'enfant :
- Nom : ${child.name}
- Date de naissance : ${child.birth_date}
- ${allergiesText}
- ${preferencesText}

Format de réponse souhaité : un tableau JSON de recettes avec les champs suivants :
- name: string (nom de la recette)
- ingredients: array of { item: string, quantity: string, unit: string }
- instructions: array of string (étapes de préparation)
- nutritional_info: { calories: number, protein: number, carbs: number, fat: number }
- meal_type: string ('breakfast', 'lunch', 'dinner', 'snack')
- preparation_time: number (en minutes)
- difficulty: string ('easy', 'medium', 'hard')
- servings: number
- health_benefits: array of { icon: string, category: string, description: string }`;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { childProfiles } = await req.json();
    console.log('Received child profiles:', childProfiles);

    if (!childProfiles || !Array.isArray(childProfiles) || childProfiles.length === 0) {
      throw new Error('Profil enfant invalide ou manquant');
    }

    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiKey) {
      throw new Error('Clé API OpenAI manquante');
    }

    const configuration = new Configuration({ apiKey: openAiKey });
    const openai = new OpenAIApi(configuration);

    const prompt = generatePrompt(childProfiles[0]);
    console.log('Generated prompt:', prompt);

    const completion = await openai.createChatCompletion({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = completion.data.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Réponse OpenAI invalide');
    }

    let recipes;
    try {
      recipes = JSON.parse(content);
      console.log('Parsed recipes:', recipes);
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      throw new Error('Erreur lors du parsing de la réponse OpenAI');
    }

    return new Response(
      JSON.stringify(recipes),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );

  } catch (error) {
    console.error('Error in generate-recipe function:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Une erreur inconnue est survenue',
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 500,
      },
    );
  }
});