import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Configuration, OpenAIApi } from "https://esm.sh/openai@4.24.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Début de la génération de recette');
    
    // Validation de la requête
    if (!req.body) {
      throw new Error("Corps de la requête manquant");
    }

    const { childProfiles, filters } = await req.json();
    console.log('Données reçues:', { childProfiles, filters });

    if (!childProfiles || !Array.isArray(childProfiles) || childProfiles.length === 0) {
      throw new Error("Profil enfant invalide ou manquant");
    }

    const child = childProfiles[0];
    if (!child.birth_date) {
      throw new Error("Date de naissance manquante");
    }

    // Traitement des préférences et allergies
    const preferences = Array.isArray(child.preferences) 
      ? child.preferences.filter(p => p && typeof p === 'string' && p.length > 0)
      : [];
    
    const allergies = Array.isArray(child.allergies)
      ? child.allergies.filter(a => a && typeof a === 'string' && a.length > 0)
      : [];

    // Calcul de l'âge
    const birthDate = new Date(child.birth_date);
    const today = new Date();
    const age = Math.floor((today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

    console.log('Informations de l\'enfant:', {
      age,
      preferences,
      allergies,
      filters
    });

    // Configuration OpenAI
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("Clé API OpenAI non configurée");
    }

    const configuration = new Configuration({
      apiKey: openaiApiKey,
    });
    const openai = new OpenAIApi(configuration);

    // Construction du prompt
    const prompt = `Génère 3 recettes uniques et saines adaptées à un enfant de ${age} ans.
    ${preferences.length > 0 ? `Prends en compte ces préférences: ${preferences.join(", ")}` : ""}
    ${allergies.length > 0 ? `Évite ces allergènes: ${allergies.join(", ")}` : ""}
    ${filters?.mealType ? `Type de repas: ${filters.mealType}` : ""}
    ${filters?.maxPrepTime ? `Temps de préparation maximum: ${filters.maxPrepTime} minutes` : ""}
    ${filters?.difficulty ? `Niveau de difficulté: ${filters.difficulty}` : ""}
    
    Formate chaque recette en objet JSON avec:
    - name (string)
    - ingredients (array de {item, quantity, unit})
    - instructions (array d'étapes)
    - nutritional_info (objet avec calories, protein, carbs, fat)
    - preparation_time (nombre en minutes)
    - difficulty (easy/medium/hard)
    - meal_type (breakfast/lunch/dinner/snack)
    
    Retourne un tableau de 3 objets recette.`;

    console.log('Prompt généré:', prompt);

    // Appel à l'API OpenAI avec gestion du timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Timeout de la requête OpenAI")), 30000);
    });

    const completionPromise = openai.createChatCompletion({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Tu es un assistant culinaire spécialisé dans la génération de recettes pour enfants en format JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const completion = await Promise.race([completionPromise, timeoutPromise]);
    
    if (!completion.data.choices[0].message?.content) {
      throw new Error("Pas de réponse de OpenAI");
    }

    const recipes = JSON.parse(completion.data.choices[0].message.content);
    console.log('Recettes générées:', recipes);

    return new Response(JSON.stringify(recipes), {
      headers: { 
        ...corsHeaders,
        "Content-Type": "application/json"
      },
    });

  } catch (error) {
    console.error("Erreur lors de la génération des recettes:", error);
    
    // Formatage de l'erreur pour le client
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    
    return new Response(
      JSON.stringify({
        error: errorMessage,
        details: error.stack || "Pas de détails disponibles"
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
      }
    );
  }
});