import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Configuration, OpenAIApi } from "https://esm.sh/openai@4.24.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { childProfiles, filters } = await req.json();
    
    // Add validation for required data
    if (!childProfiles || !childProfiles[0]) {
      throw new Error("No child profile provided");
    }
    
    const child = childProfiles[0];
    console.log("Received child profile:", child);
    console.log("Received filters:", filters);

    // Safely access and filter arrays with null checks
    const preferences = Array.isArray(child.preferences) 
      ? child.preferences.filter(p => p && typeof p === 'string' && p.trim() !== '')
      : [];
    
    const allergies = Array.isArray(child.allergies)
      ? child.allergies.filter(a => a && typeof a === 'string' && a.trim() !== '')
      : [];

    console.log("Processed preferences:", preferences);
    console.log("Processed allergies:", allergies);

    // Calculate age with validation
    let age = 0;
    try {
      const birthDate = new Date(child.birth_date);
      const today = new Date();
      age = Math.floor((today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    } catch (error) {
      console.error("Error calculating age:", error);
      age = 5; // Default age if calculation fails
    }

    // Initialize OpenAI
    const configuration = new Configuration({
      apiKey: Deno.env.get("OPENAI_API_KEY"),
    });
    const openai = new OpenAIApi(configuration);

    // Build the prompt with filters
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

    console.log("Generated prompt:", prompt);

    const response = await openai.createChatCompletion({
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

    if (!response.data.choices[0].message?.content) {
      throw new Error("No response from OpenAI");
    }

    const recipes = JSON.parse(response.data.choices[0].message.content);
    console.log("Generated recipes:", recipes);

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
        stack: error.stack 
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