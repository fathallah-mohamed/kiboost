import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.2.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation optimisée avec Set pour une recherche O(1)
const validHealthCategories = new Set([
  'cognitive', 'energy', 'satiety', 'digestive', 'immunity',
  'growth', 'mental', 'organs', 'beauty', 'physical',
  'prevention', 'global'
]);

// Fonction optimisée pour générer le prompt
const generatePrompt = (child: any, filters: any) => {
  const allergiesText = child.allergies?.length 
    ? `Allergies à éviter : ${child.allergies.join(', ')}`
    : 'Aucune allergie connue';
  
  const preferencesText = child.preferences?.length 
    ? `Préférences alimentaires : ${child.preferences.join(', ')}`
    : 'Aucune préférence particulière';

  // Construction efficace des contraintes
  const constraints = [
    filters.mealType !== 'all' && `Type de repas : ${filters.mealType}`,
    filters.maxPrepTime && `Temps maximum : ${filters.maxPrepTime}min`,
    filters.difficulty !== 'all' && `Difficulté : ${filters.difficulty}`
  ].filter(Boolean);

  return `Génère 3 recettes DIFFÉRENTES et CRÉATIVES pour enfant:
Age: ${child.birth_date}
${allergiesText}
${preferencesText}
${constraints.length ? 'Contraintes: ' + constraints.join(', ') : ''}

IMPORTANT:
- 3 bienfaits santé PARFAITEMENT distincts parmi: ${[...validHealthCategories].join(', ')} dans CHAQUE recette.
- Varies les ingrédients entre les recettes.
- Temps réaliste (préparation + cuisson).
- Ingrédients courants uniquement.
- Instructions claires et concises.
- Recettes UNIQUES (noms et ingrédients différents).

FORMAT JSON STRICT (UTILISE DES GUILLEMETS DOUBLES UNIQUEMENT):
{
  "recipes": [
    {
      "name": "string",
      "ingredients": [{"item": "string", "quantity": "string", "unit": "string"}],
      "instructions": ["string"],
      "nutritional_info": {"calories": number, "protein": number, "carbs": number, "fat": number},
      "meal_type": "breakfast|lunch|dinner|snack",
      "preparation_time": number,
      "difficulty": "easy|medium|hard",
      "servings": number,
      "health_benefits": [{"icon": "string", "category": "string", "description": "string"}]
    }
  ]
}`;
};

// Fonction de nettoyage JSON optimisée
const cleanJsonContent = (content: string): string => {
  try {
    // Remove markdown and normalize quotes
    let cleanContent = content
      .replace(/```json\n?|\n?```/g, '')
      .replace(/[\u0000-\u001F]+/g, ' ')
      .replace(/['']/g, "'")
      .replace(/[""]/g, '"')
      .trim();

    // Ensure we have valid JSON
    const parsed = JSON.parse(cleanContent);
    if (!parsed.recipes || !Array.isArray(parsed.recipes)) {
      throw new Error('Invalid JSON structure: missing recipes array');
    }

    return cleanContent;
  } catch (error) {
    console.error('Error cleaning JSON content:', error);
    console.log('Raw content:', content);
    throw new Error(`JSON parsing error: ${error.message}`);
  }
};

// Validation rapide de la structure des recettes
const validateRecipe = (recipe: any): boolean => {
  const requiredFields = [
    'name', 'ingredients', 'instructions', 'nutritional_info',
    'meal_type', 'preparation_time', 'difficulty', 'servings', 'health_benefits'
  ];
  
  return requiredFields.every(field => recipe[field] !== undefined) &&
    Array.isArray(recipe.ingredients) &&
    Array.isArray(recipe.instructions) &&
    Array.isArray(recipe.health_benefits) &&
    recipe.health_benefits.length === 3;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { child, filters } = await req.json();
    console.log('Generating recipes for:', { child, filters });

    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiKey) throw new Error('OpenAI API key missing');

    const configuration = new Configuration({ apiKey: openAiKey });
    const openai = new OpenAIApi(configuration);

    const prompt = generatePrompt(child, filters);
    console.log('Using optimized prompt:', prompt);

    const completion = await openai.createChatCompletion({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: 'Tu es un chef expert en recettes pour enfants. Génère UNIQUEMENT du JSON valide avec des guillemets doubles.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      presence_penalty: 0.3,
      frequency_penalty: 0.5
    });

    const content = completion.data.choices[0]?.message?.content;
    if (!content) throw new Error('Invalid OpenAI response');

    console.log('Raw OpenAI response:', content);
    const cleanedContent = cleanJsonContent(content);
    console.log('Cleaned content:', cleanedContent);

    const parsedContent = JSON.parse(cleanedContent);
    
    if (!parsedContent.recipes || !Array.isArray(parsedContent.recipes)) {
      throw new Error('Invalid format: missing "recipes" property or not an array');
    }

    // Validation rapide des recettes
    const recipes = parsedContent.recipes;
    const recipeNames = new Set();
    
    recipes.forEach((recipe, index) => {
      if (!validateRecipe(recipe)) {
        throw new Error(`Invalid structure for recipe ${index + 1}`);
      }
      if (recipeNames.has(recipe.name)) {
        throw new Error('Recipes must have unique names');
      }
      recipeNames.add(recipe.name);
    });

    return new Response(
      JSON.stringify({ recipes }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );

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