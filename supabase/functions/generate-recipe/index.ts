import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function retryWithDelay(fn: () => Promise<any>, maxRetries = 3, initialDelay = 1000) {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${i + 1} failed:`, error);
      
      if (error.message?.includes('Too Many Requests')) {
        const waitTime = initialDelay * Math.pow(2, i);
        console.log(`Waiting ${waitTime}ms before retry...`);
        await delay(waitTime);
      } else {
        throw error;
      }
    }
  }
  throw lastError;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the JWT token from the Authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Extract the user ID from the JWT token
    const token = authHeader.replace('Bearer ', '');
    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    const userId = tokenPayload.sub;

    console.log('User ID extracted from token:', userId);

    if (!openAIApiKey) {
      console.error('OpenAI API key not configured');
      throw new Error('OpenAI API key is not configured. Please set up the OPENAI_API_KEY secret.');
    }

    const { childProfile } = await req.json();
    console.log('Generating recipe for child profile:', childProfile);

    const prompt = `Generate a healthy breakfast recipe suitable for a ${childProfile.age} year old child.
    ${childProfile.allergies?.length > 0 ? `Allergies to avoid: ${childProfile.allergies.join(', ')}` : ''}
    ${childProfile.preferences?.length > 0 ? `Food preferences: ${childProfile.preferences.join(', ')}` : ''}
    
    Please provide a recipe that is:
    1. Age-appropriate
    2. Nutritionally balanced
    3. Easy to prepare
    4. Safe considering any allergies
    5. Takes into account preferences
    
    The response MUST be a valid JSON object with EXACTLY this structure:
    {
      "name": "Recipe Name",
      "ingredients": [
        {"item": "ingredient name", "quantity": "amount", "unit": "measurement unit"}
      ],
      "instructions": ["step 1", "step 2", "etc"],
      "nutritional_info": {
        "calories": number,
        "protein": number,
        "carbs": number,
        "fat": number
      }
    }`;

    const generateRecipeWithOpenAI = async () => {
      console.log('Making request to OpenAI API...');
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
              content: 'You are a professional nutritionist specializing in children\'s dietary needs. You must respond with valid JSON only, no additional text or explanations.'
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('OpenAI API error:', error);
        throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      console.log('Raw OpenAI response:', data);
      return data;
    };

    const data = await retryWithDelay(generateRecipeWithOpenAI);
    console.log('OpenAI response processed');
    
    try {
      if (!data.choices?.[0]?.message?.content) {
        console.error('Invalid OpenAI response structure:', data);
        throw new Error('Invalid response structure from OpenAI');
      }

      const content = data.choices[0].message.content.trim();
      console.log('Attempting to parse content:', content);

      let recipeContent;
      try {
        recipeContent = JSON.parse(content);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Content that failed to parse:', content);
        throw new Error('Failed to parse OpenAI response as JSON');
      }

      // Validate the recipe structure
      if (!recipeContent.name || !Array.isArray(recipeContent.ingredients) || 
          !Array.isArray(recipeContent.instructions) || !recipeContent.nutritional_info) {
        console.error('Invalid recipe structure:', recipeContent);
        throw new Error('Recipe data is missing required fields');
      }

      console.log('Recipe generated successfully:', recipeContent);

      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      // Use the extracted userId instead of the JWT token
      const { data: recipe, error: insertError } = await supabaseClient
        .from('recipes')
        .insert({
          profile_id: userId,
          name: recipeContent.name,
          ingredients: recipeContent.ingredients,
          instructions: recipeContent.instructions,
          nutritional_info: recipeContent.nutritional_info,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting recipe:', insertError);
        throw insertError;
      }

      return new Response(JSON.stringify(recipe), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error('Error parsing or validating recipe data:', parseError);
      throw new Error(`Failed to parse or validate recipe data: ${parseError.message}`);
    }
  } catch (error) {
    console.error('Error in generate-recipe function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});