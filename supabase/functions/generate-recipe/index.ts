import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fonction utilitaire pour attendre un certain temps
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Fonction pour réessayer avec délai en cas d'erreur
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
    const { childProfile } = await req.json();
    console.log('Generating recipe for child profile:', childProfile);

    const prompt = `Generate a healthy breakfast recipe suitable for a ${childProfile.age} year old child.
    ${childProfile.allergies.length > 0 ? `Allergies to avoid: ${childProfile.allergies.join(', ')}` : ''}
    ${childProfile.preferences.length > 0 ? `Food preferences: ${childProfile.preferences.join(', ')}` : ''}
    
    Please provide a recipe that is:
    1. Age-appropriate
    2. Nutritionally balanced
    3. Easy to prepare
    4. Safe considering any allergies
    5. Takes into account preferences
    
    Format the response exactly like this example:
    {
      "name": "Banana Oatmeal Bowl",
      "ingredients": [
        {"item": "rolled oats", "quantity": "1/2", "unit": "cup"},
        {"item": "banana", "quantity": "1", "unit": "medium"}
      ],
      "instructions": [
        "Pour oats into a bowl",
        "Add milk and microwave for 2 minutes"
      ],
      "nutritional_info": {
        "calories": 300,
        "protein": 8,
        "carbs": 45,
        "fat": 6
      }
    }`;

    const generateRecipeWithOpenAI = async () => {
      if (!openAIApiKey) {
        throw new Error('OpenAI API key is not configured');
      }

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
              content: 'You are a professional nutritionist specializing in children\'s dietary needs. Generate appropriate, safe, and healthy breakfast recipes.'
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
      console.log('OpenAI response received:', data);
      return data;
    };

    const data = await retryWithDelay(generateRecipeWithOpenAI);
    console.log('OpenAI response processed');
    
    try {
      const recipeContent = JSON.parse(data.choices[0].message.content);
      console.log('Recipe generated:', recipeContent);

      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const { data: recipe, error: insertError } = await supabaseClient
        .from('recipes')
        .insert({
          profile_id: req.headers.get('authorization')?.split(' ')[1],
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
      console.error('Error parsing OpenAI response:', parseError);
      throw new Error('Failed to parse recipe data from OpenAI response');
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