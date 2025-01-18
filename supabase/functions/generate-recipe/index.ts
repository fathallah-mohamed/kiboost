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
    console.log('Received request to generate recipe');
    const { childProfiles, filters } = await req.json();
    console.log('Request data:', { childProfiles, filters });
    
    if (!childProfiles || !childProfiles[0]) {
      throw new Error("No child profile provided");
    }
    
    const child = childProfiles[0];
    
    // Filter out empty strings from preferences and allergies
    const preferences = Array.isArray(child.preferences) 
      ? child.preferences.filter(p => p && typeof p === 'string' && p.length > 0)
      : [];
    
    const allergies = Array.isArray(child.allergies)
      ? child.allergies.filter(a => a && typeof a === 'string' && a.length > 0)
      : [];

    // Calculate age
    const birthDate = new Date(child.birth_date);
    const today = new Date();
    const age = Math.floor((today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

    console.log('Processing request for child:', {
      age,
      preferences,
      allergies,
      filters
    });

    // Initialize OpenAI
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("OpenAI API key not configured");
    }

    const configuration = new Configuration({
      apiKey: openaiApiKey,
    });
    const openai = new OpenAIApi(configuration);

    // Build prompt
    const prompt = `Generate 3 unique, healthy recipes suitable for a ${age}-year-old child.
    ${preferences.length > 0 ? `Consider these preferences: ${preferences.join(", ")}` : ""}
    ${allergies.length > 0 ? `Avoid these allergens: ${allergies.join(", ")}` : ""}
    ${filters?.mealType ? `Meal type: ${filters.mealType}` : ""}
    ${filters?.maxPrepTime ? `Maximum preparation time: ${filters.maxPrepTime} minutes` : ""}
    ${filters?.difficulty ? `Difficulty level: ${filters.difficulty}` : ""}
    
    Format each recipe as a JSON object with:
    - name (string)
    - ingredients (array of {item, quantity, unit})
    - instructions (array of steps)
    - nutritional_info (object with calories, protein, carbs, fat)
    - preparation_time (number in minutes)
    - difficulty (easy/medium/hard)
    - meal_type (breakfast/lunch/dinner/snack)
    
    Return an array of 3 recipe objects.`;

    console.log('Generated prompt:', prompt);

    const completion = await openai.createChatCompletion({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that generates recipes in JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    if (!completion.data.choices[0].message?.content) {
      throw new Error("No response from OpenAI");
    }

    const recipes = JSON.parse(completion.data.choices[0].message.content);
    console.log('Generated recipes:', recipes);

    return new Response(JSON.stringify(recipes), {
      headers: { 
        ...corsHeaders,
        "Content-Type": "application/json"
      },
    });

  } catch (error) {
    console.error("Error generating recipes:", error);
    
    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.stack
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