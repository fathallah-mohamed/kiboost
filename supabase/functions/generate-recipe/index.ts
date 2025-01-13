import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RecipeRequest {
  childProfile: {
    age: number;
    allergies: string[];
    preferences: string[];
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { childProfile } = await req.json() as RecipeRequest;

    // Construct the prompt based on child's profile
    const prompt = `Generate a healthy breakfast recipe suitable for a ${childProfile.age} year old child.
    ${childProfile.allergies.length > 0 ? `Allergies to avoid: ${childProfile.allergies.join(', ')}` : ''}
    ${childProfile.preferences.length > 0 ? `Food preferences: ${childProfile.preferences.join(', ')}` : ''}
    
    Please provide the response in the following JSON format:
    {
      "name": "Recipe name",
      "ingredients": [{"item": "ingredient", "quantity": "amount", "unit": "measurement"}],
      "instructions": ["step 1", "step 2", ...],
      "nutritionalInfo": {
        "calories": number,
        "protein": number,
        "carbs": number,
        "fat": number
      }
    }`;

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{
          role: 'user',
          content: prompt,
        }],
        temperature: 0.7,
      }),
    });

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIResponse.statusText}`);
    }

    const openAIData = await openAIResponse.json();
    const recipeResponse = JSON.parse(openAIData.choices[0].message.content);

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Save recipe to database
    const { data: recipe, error: insertError } = await supabaseClient
      .from('recipes')
      .insert({
        profile_id: req.headers.get('x-user-id'),
        name: recipeResponse.name,
        ingredients: recipeResponse.ingredients,
        instructions: recipeResponse.instructions,
        nutritional_info: recipeResponse.nutritionalInfo,
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return new Response(
      JSON.stringify(recipe),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    console.error('Error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
})