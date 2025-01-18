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
    const { preferences, allergies, age } = await req.json();

    // Initialize OpenAI
    const configuration = new Configuration({
      apiKey: Deno.env.get("OPENAI_API_KEY"),
    });
    const openai = new OpenAIApi(configuration);

    // Optimize prompt for faster generation
    const prompt = `Generate 3 unique, healthy recipes suitable for a ${age}-year-old child.
    Consider these preferences: ${preferences.join(", ")}
    Avoid these allergens: ${allergies.join(", ")}
    
    Format each recipe as a JSON object with:
    - name (string)
    - ingredients (array of {item, quantity, unit})
    - instructions (array of steps)
    - nutritional_info (object with calories, protein, carbs, fat)
    - preparation_time (number in minutes)
    - difficulty (easy/medium/hard)
    - meal_type (breakfast/lunch/dinner/snack)
    
    Return an array of 3 recipe objects.`;

    console.log("Generating recipes with prompt:", prompt);

    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const recipes = JSON.parse(completion.data.choices[0].message.content);
    console.log("Generated recipes:", recipes);

    return new Response(JSON.stringify(recipes), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating recipes:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});