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

    // Format existing recipe names for the prompt
    const existingRecipeNames = existingRecipes
      ?.map((recipe: any) => recipe.name)
      .join(", ") || "None";

    const prompt = `You are a professional chef specialized in children's nutrition. Generate 5 unique, healthy recipes for a child with the following characteristics:
      - Name: ${child.name}
      - Age: ${new Date().getFullYear() - new Date(child.birth_date).getFullYear()} years old
      - Allergies: ${child.allergies?.join(", ") || "None"}
      - Preferences: ${child.preferences?.join(", ") || "No specific preferences"}
      
      Please avoid these existing recipes: ${existingRecipeNames}
      
      Return ONLY a JSON array of recipe objects with NO additional text or formatting. Each recipe must follow this exact structure:
      {
        "name": "string",
        "ingredients": [{"item": "string", "quantity": "string", "unit": "string"}],
        "instructions": ["string"],
        "nutritional_info": {"calories": number, "protein": number, "carbs": number, "fat": number},
        "meal_type": "breakfast" | "lunch" | "dinner" | "snack",
        "preparation_time": number,
        "difficulty": "easy" | "medium" | "hard",
        "servings": number,
        "health_benefits": [{"icon": "string", "category": "string", "description": "string"}],
        "min_age": number,
        "max_age": number,
        "dietary_preferences": ["string"],
        "allergens": ["string"],
        "cost_estimate": number,
        "seasonal_months": [number]
      }`;

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
            content: "You are a professional chef specialized in children's nutrition. You create unique, healthy, and appealing recipes for children. Always return data in pure JSON format with no markdown or additional text."
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
      const content = data.choices[0].message.content;
      console.log("Raw OpenAI response content:", content);
      
      // Clean up the content by removing any markdown formatting
      const cleanContent = content.replace(/```json\n|\n```|```/g, '').trim();
      console.log("Cleaned content:", cleanContent);
      
      recipes = JSON.parse(cleanContent);
      
      // Validate recipe structure
      if (!Array.isArray(recipes)) {
        throw new Error("Recipes must be an array");
      }

      recipes = recipes.map(recipe => ({
        ...recipe,
        is_generated: true,
        profile_id: child.profile_id,
        image_url: recipe.image_url || 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
      }));

      console.log("Successfully parsed and processed recipes:", recipes);
    } catch (e) {
      console.error("Error parsing recipe data:", e);
      throw new Error(`Failed to parse recipe data: ${e.message}`);
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
    console.error("Error in generate-recipe function:", error);
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