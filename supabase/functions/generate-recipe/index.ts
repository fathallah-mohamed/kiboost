import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { buildPrompt } from "./prompt-builder.ts";
import { generateRecipesWithOpenAI } from "./openai-client.ts";
import { ChildProfile, RecipeFilters } from "./types.ts";

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

    const { childProfiles, filters, offset = 0 } = await req.json();
    console.log('Received request with child profiles:', childProfiles);
    console.log('Filters:', filters);
    console.log('Offset:', offset);

    const prompt = buildPrompt(childProfiles, filters, offset);
    console.log('Sending request to OpenAI with prompt:', prompt);
    
    const content = await generateRecipesWithOpenAI(prompt, openAIApiKey);
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