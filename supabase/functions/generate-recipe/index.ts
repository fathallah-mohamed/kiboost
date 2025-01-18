import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.1.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { childProfiles, filters } = await req.json();
    const child = childProfiles[0];
    
    console.log("Generating recipes for child:", child, "with filters:", filters);

    // Initialize OpenAI
    const configuration = new Configuration({
      apiKey: Deno.env.get("OPENAI_API_KEY"),
    });
    const openai = new OpenAIApi(configuration);

    // Construct a clear, structured prompt
    const prompt = `Generate 3 unique, healthy recipes suitable for a child aged ${calculateAge(child.birth_date)} years.
    Consider these preferences: ${child.preferences?.join(", ") || "no specific preferences"}
    Avoid these allergens: ${child.allergies?.join(", ") || "no allergies"}
    
    Additional filters:
    - Meal type: ${filters?.mealType || "any"}
    - Maximum preparation time: ${filters?.maxPrepTime || "any"} minutes
    - Difficulty level: ${filters?.difficulty || "any"}
    
    Format each recipe as a valid JSON object with:
    {
      "name": "string",
      "ingredients": [{"item": "string", "quantity": "string", "unit": "string"}],
      "instructions": "string",
      "nutritional_info": {"calories": number, "protein": number, "carbs": number, "fat": number},
      "preparation_time": number,
      "difficulty": "easy/medium/hard",
      "meal_type": "breakfast/lunch/dinner/snack",
      "health_benefits": ["string"],
      "min_age": number,
      "max_age": number
    }
    
    Return an array of exactly 3 recipe objects.`;

    console.log("Sending prompt to OpenAI:", prompt);

    const completion = await openai.createChatCompletion({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const recipesText = completion.data.choices[0].message.content;
    console.log("Raw OpenAI response:", recipesText);

    // Safely parse the JSON response
    let recipes;
    try {
      recipes = JSON.parse(recipesText.trim());
      
      // Validate the response structure
      if (!Array.isArray(recipes) || recipes.length !== 3) {
        throw new Error("Invalid response format: expected array of 3 recipes");
      }

      // Add generated flag and default image
      recipes = recipes.map(recipe => ({
        ...recipe,
        is_generated: true,
        image_url: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9",
      }));

    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      throw new Error(`JSON parsing error: ${parseError.message}`);
    }

    return new Response(JSON.stringify(recipes), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in generate-recipe function:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        details: "Une erreur est survenue lors de la génération des recettes. Veuillez réessayer."
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}