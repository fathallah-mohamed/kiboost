import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { childProfiles, filters } = await req.json();
    const child = childProfiles[0];
    
    console.log("Generating recipes for child:", child, "with filters:", filters);

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Construct a clear, structured prompt
    const prompt = `You are a recipe generation assistant. Generate exactly 3 unique, healthy recipes suitable for a child aged ${calculateAge(child.birth_date)} years.
    Consider these preferences: ${child.preferences?.join(", ") || "no specific preferences"}
    Avoid these allergens: ${child.allergies?.join(", ") || "no allergies"}
    
    Additional filters:
    - Meal type: ${filters?.mealType || "any"}
    - Maximum preparation time: ${filters?.maxPrepTime || "any"} minutes
    - Difficulty level: ${filters?.difficulty || "any"}
    
    Return ONLY a valid JSON array containing exactly 3 recipe objects. Each recipe object must follow this exact structure:
    {
      "name": "string",
      "ingredients": [{"item": "string", "quantity": "string", "unit": "string"}],
      "instructions": ["string"],
      "nutritional_info": {"calories": number, "protein": number, "carbs": number, "fat": number},
      "preparation_time": number,
      "difficulty": "easy/medium/hard",
      "meal_type": "breakfast/lunch/dinner/snack",
      "health_benefits": ["string"],
      "min_age": number,
      "max_age": number
    }
    
    Do not include any markdown formatting, code blocks, or additional text. Return only the JSON array.`;

    console.log("Sending prompt to OpenAI:", prompt);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a recipe generation assistant. Always return valid JSON arrays containing exactly 3 recipe objects. Never include markdown formatting or additional text.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("OpenAI API error:", error);
      throw new Error('Failed to generate recipes from OpenAI');
    }

    const data = await response.json();
    const recipesText = data.choices[0].message.content;
    console.log("Raw OpenAI response:", recipesText);

    // Clean up any potential markdown formatting
    const cleanedText = recipesText.replace(/```json\n|\n```/g, '').trim();
    console.log("Cleaned response:", cleanedText);

    // Safely parse the JSON response
    let recipes;
    try {
      recipes = JSON.parse(cleanedText);
      
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