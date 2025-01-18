import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Pas d\'en-tête d\'autorisation');
    }

    if (!openAIApiKey) {
      throw new Error('Clé API OpenAI non configurée');
    }

    const { childProfiles, filters } = await req.json();
    console.log('Received request with child profiles:', childProfiles);
    console.log('Filters:', filters);

    const allAllergies = [...new Set(childProfiles.flatMap(child => child.allergies || []))];
    const commonPreferences = childProfiles.reduce((common, child) => {
      if (common.length === 0) return child.preferences || [];
      return common.filter(pref => (child.preferences || []).includes(pref));
    }, []);

    const ageRange = {
      min: filters?.minAge || Math.min(...childProfiles.map(child => child.age)),
      max: filters?.maxAge || Math.max(...childProfiles.map(child => child.age))
    };

    // Construction d'un prompt plus concis mais toujours efficace
    const prompt = `En tant que chef nutritionniste, crée 3 recettes ${filters?.mealType || 'dinner'} 
    ${filters?.difficulty ? `de difficulté ${filters.difficulty}` : ''} 
    ${filters?.maxPrepTime ? `en moins de ${filters.maxPrepTime} minutes` : ''} 
    pour ${childProfiles.length} enfant(s) de ${ageRange.min}-${ageRange.max} ans.

    ${allAllergies.length ? `⚠️ ALLERGIES: ${allAllergies.join(', ')}` : ''}
    ${filters?.dietaryPreferences?.length ? `RÉGIMES: ${filters.dietaryPreferences.join(', ')}` : ''}
    ${commonPreferences.length ? `PRÉFÉRENCES: ${commonPreferences.join(', ')}` : ''}

    Pour chaque recette, fournis:
    - name: nom créatif
    - ingredients: [{item, quantity, unit}]
    - instructions: [étapes]
    - nutritional_info: {calories, protein, carbs, fat}
    - health_benefits: [{category, description, icon}] (parmi: cognitive, energy, satiety, digestive, immunity, growth, mental, organs, beauty, physical, prevention, global)
    - meal_type, preparation_time, difficulty, servings
    - min_age, max_age, dietary_preferences, allergens, cost_estimate
    - seasonal_months: [1-12]

    Réponds uniquement en JSON.`;

    console.log('Sending optimized prompt to OpenAI:', prompt);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Utilisation du modèle plus rapide
        messages: [
          {
            role: 'system',
            content: 'Tu es un chef cuisinier expert en nutrition infantile. Réponds uniquement en JSON valide.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7, // Réduction pour plus de cohérence
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error(`Erreur API OpenAI : ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    console.log('OpenAI response received:', data);
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Structure de réponse OpenAI invalide');
    }

    let content = data.choices[0].message.content.trim();
    if (content.startsWith('```')) {
      content = content.replace(/```json\n?/, '').replace(/```\n?$/, '');
    }

    console.log('Parsing JSON response:', content);
    let recipes;
    try {
      recipes = JSON.parse(content);
    } catch (error) {
      console.error('JSON parse error:', error);
      throw new Error(`Échec du parsing JSON : ${error.message}`);
    }

    if (!Array.isArray(recipes)) {
      console.error('Invalid recipes structure:', recipes);
      throw new Error('Structure des recettes invalide');
    }

    const processedRecipes = recipes.map(recipe => ({
      ...recipe,
      is_generated: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profile_id: childProfiles[0].profile_id,
    }));

    return new Response(JSON.stringify(processedRecipes), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-recipe function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: "Une erreur est survenue lors de la génération des recettes. Veuillez réessayer."
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});