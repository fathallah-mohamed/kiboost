import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { buildPrompt } from "./prompt-builder.ts";
import { generateRecipesWithOpenAI } from "./openai-client.ts";
import { ChildProfile, RecipeFilters } from "./types.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders 
    });
  }

  try {
    if (!openAIApiKey) {
      console.error('OpenAI API key not configured');
      throw new Error('OpenAI API key not configured');
    }

    const requestData = await req.json();
    console.log('Received request data:', requestData);

    const { childProfiles, filters, offset = 0 } = requestData;
    
    if (!childProfiles || !Array.isArray(childProfiles) || childProfiles.length === 0) {
      throw new Error('Invalid or missing childProfiles in request');
    }

    const prompt = buildPrompt(childProfiles, filters, offset);
    console.log('Built prompt:', prompt);
    
    const content = await generateRecipesWithOpenAI(prompt, openAIApiKey);
    console.log('Received response from OpenAI:', content);

    let recipes;
    try {
      recipes = JSON.parse(content);
      console.log('Successfully parsed recipes:', recipes);
    } catch (error) {
      console.error('JSON parse error:', error);
      console.error('Content that failed to parse:', content);
      throw new Error(`Failed to parse OpenAI response as JSON: ${error.message}`);
    }

    if (!Array.isArray(recipes)) {
      console.error('Invalid recipes structure:', recipes);
      throw new Error('OpenAI response is not an array of recipes');
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
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      },
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