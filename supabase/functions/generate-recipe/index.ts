import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.2.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const generatePrompt = (child: any, filters: any) => {
  const allergiesText = child.allergies?.length > 0 
    ? `Allergies à éviter : ${child.allergies.join(', ')}`
    : 'Aucune allergie connue';
    
  const preferencesText = child.preferences?.length > 0
    ? `Préférences alimentaires : ${child.preferences.join(', ')}`
    : 'Aucune préférence particulière';

  const validCategories = [
    'cognitive', 'energy', 'satiety', 'digestive', 'immunity',
    'growth', 'mental', 'organs', 'beauty', 'physical',
    'prevention', 'global'
  ];

  let constraints = [];
  if (filters.mealType && filters.mealType !== 'all') {
    constraints.push(`Type de repas : ${filters.mealType}`);
  }
  if (filters.maxPrepTime) {
    constraints.push(`Temps maximum : ${filters.maxPrepTime}min`);
  }
  if (filters.difficulty && filters.difficulty !== 'all') {
    constraints.push(`Difficulté : ${filters.difficulty}`);
  }

  const timeConstraint = filters.maxPrepTime && filters.maxPrepTime <= 15
    ? `\nRecettes rapides suggérées : smoothies, bowls de céréales, tartines garnies, yaourts avec toppings, fruits préparés, pancakes express, overnight oats, wraps express`
    : '';

  return `Génère 3 recettes rapides pour enfant:
Age: ${child.birth_date}
${allergiesText}
${preferencesText}
${constraints.length ? 'Contraintes: ' + constraints.join(', ') : ''}
${timeConstraint}

IMPORTANT:
- 3 bienfaits santé par recette parmi: ${validCategories.join(', ')}
- Temps réaliste incluant préparation + cuisson
- Ingrédients simples et prêts à l'emploi
- Étapes courtes et efficaces

Format JSON uniquement, sans commentaires ni backticks:
[{
  "name": "Nom de la recette",
  "ingredients": [{"item": "Ingrédient", "quantity": "Quantité", "unit": "Unité"}],
  "instructions": ["Étape 1", "Étape 2"],
  "nutritional_info": {"calories": 0, "protein": 0, "carbs": 0, "fat": 0},
  "meal_type": "breakfast",
  "preparation_time": 15,
  "difficulty": "easy",
  "servings": 4,
  "health_benefits": [{"icon": "brain", "category": "cognitive", "description": "Description du bienfait"}]
}]`;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { child, filters } = await req.json();
    console.log('Generating recipes for:', { child, filters });

    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiKey) throw new Error('OpenAI API key missing');

    const configuration = new Configuration({ apiKey: openAiKey });
    const openai = new OpenAIApi(configuration);

    const prompt = generatePrompt(child, filters);
    console.log('Using prompt:', prompt);

    const completion = await openai.createChatCompletion({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: 'Tu es un chef spécialisé en recettes rapides pour enfants. Réponds uniquement en JSON valide sans backticks ni commentaires.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = completion.data.choices[0]?.message?.content;
    if (!content) throw new Error('Réponse OpenAI invalide');

    // Nettoyage et validation du JSON
    const cleanedContent = content
      .replace(/```json\n?|\n?```/g, '')
      .trim();

    try {
      const recipes = JSON.parse(cleanedContent);
      
      if (!Array.isArray(recipes) || recipes.length === 0) {
        throw new Error('Format de recettes invalide');
      }

      return new Response(
        JSON.stringify({ recipes }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );

    } catch (parseError) {
      console.error('JSON parsing error:', parseError, '\nContent:', cleanedContent);
      throw new Error(`Erreur de parsing JSON: ${parseError.message}`);
    }

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});