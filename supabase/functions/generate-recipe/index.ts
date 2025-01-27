import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { child, filters, existingRecipes = [] } = await req.json();
    console.log("Received request with:", { child, filters, existingRecipesCount: existingRecipes.length });

    // Validate required data
    if (!child || !child.name || !child.birth_date) {
      console.error("Invalid child data:", child);
      throw new Error("Invalid child data: name and birth_date are required");
    }

    // Calculate age
    const birthDate = new Date(child.birth_date);
    const age = new Date().getFullYear() - birthDate.getFullYear();

    // Format existing recipe names for the prompt
    const existingRecipeNames = existingRecipes?.map((recipe: any) => recipe.name).join(", ") || "None";
    
    // Format allergies and preferences
    const allergies = Array.isArray(child.allergies) ? child.allergies.filter(Boolean).join(", ") : "None";
    const preferences = Array.isArray(child.preferences) ? child.preferences.filter(Boolean).join(", ") : "No specific preferences";

    const prompt = `Generate 5 unique, healthy recipes for a child with the following characteristics:
      - Name: ${child.name}
      - Age: ${age} years old
      - Allergies: ${allergies}
      - Preferences: ${preferences}
      
      Please avoid these existing recipes: ${existingRecipeNames}
      
      Each recipe should include:
      - A unique and creative name
      - List of ingredients with quantities
      - Step by step instructions
      - Nutritional information (calories, protein, carbs, fat)
      - Preparation time
      - Difficulty level (easy, medium, hard)
      - Number of servings
      - Health benefits for children
      - Age recommendations (min and max age)
      - Any allergens present
      - Estimated cost
      - Seasonal availability
      
      Format the response as a JSON array of recipe objects.`;

    console.log("Sending prompt to OpenAI:", prompt);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a professional chef specialized in children's nutrition. You create unique, healthy, and appealing recipes for children."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.9,
      }),
    });

    const data = await response.json();
    console.log("OpenAI Response:", data);

    if (!data.choices?.[0]?.message?.content) {
      throw new Error("Invalid response from OpenAI");
    }

    let recipes;
    try {
      recipes = JSON.parse(data.choices[0].message.content);
      console.log("Successfully parsed recipes:", recipes);
    } catch (e) {
      console.error("Error parsing OpenAI response:", e);
      throw new Error("Failed to parse recipe data");
    }

    return new Response(
      JSON.stringify({ recipes }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});