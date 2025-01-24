import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.2.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation des catégories de bienfaits santé
const validHealthCategories = new Set([
  'cognitive', 'energy', 'satiety', 'digestive', 'immunity',
  'growth', 'mental', 'organs', 'beauty', 'physical',
  'prevention', 'global'
]);

// Fonction pour générer un prompt optimisé
const generatePrompt = (child: any, filters: any, generatedRecipes: any[] = []) => {
  // Construction efficace des textes avec template literals
  const allergiesText = child.allergies?.length 
    ? `Allergies à éviter : ${child.allergies.join(', ')}`
    : 'Aucune allergie connue';
  
  const preferencesText = child.preferences?.length 
    ? `Préférences alimentaires : ${child.preferences.join(', ')}`
    : 'Aucune préférence particulière';

  // Construction optimisée des contraintes
  const constraints = [
    filters.mealType !== 'all' && `Type de repas : ${filters.mealType}`,
    filters.maxPrepTime && `Temps maximum : ${filters.maxPrepTime}min`,
    filters.difficulty !== 'all' && `Difficulté : ${filters.difficulty}`
  ].filter(Boolean);

  // Exclusion des recettes déjà générées
  const excludeRecipes = generatedRecipes.length
    ? `Exclure ces recettes : ${generatedRecipes.map(r => r.name).join(', ')}`
    : '';

  return `Génère 3 recettes DIFFÉRENTES et CRÉATIVES pour enfant:
Age: ${child.birth_date}
${allergiesText}
${preferencesText}
${constraints.length ? 'Contraintes: ' + constraints.join(', ') : ''}
${excludeRecipes}

IMPORTANT:
- 3 bienfaits santé PARFAITEMENT distincts parmi: ${[...validHealthCategories].join(', ')} dans CHAQUE recette.
- Varies les ingrédients entre les recettes.
- Temps réaliste (préparation + cuisson).
- Ingrédients courants uniquement.
- Instructions claires et concises.
- Recettes UNIQUES (noms et ingrédients différents).

FORMAT JSON STRICT:
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
  return content
    .replace(/```json\n?|\n?```/g, '')
    .replace(/[\u0000-\u001F]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
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
          content: 'Tu es un chef expert en recettes pour enfants. Génère UNIQUEMENT du JSON valide.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 2000,
      presence_penalty: 0.6,
      frequency_penalty: 0.8
    });

    const content = completion.data.choices[0]?.message?.content;
    if (!content) throw new Error('Réponse OpenAI invalide');

    console.log('Raw OpenAI response:', content);
    const cleanedContent = cleanJsonContent(content);
    console.log('Cleaned content:', cleanedContent);

    const parsedContent = JSON.parse(cleanedContent);
    
    if (!parsedContent.recipes || !Array.isArray(parsedContent.recipes)) {
      throw new Error('Format invalide: propriété "recipes" manquante ou invalide');
    }

    // Validation rapide des recettes
    const recipes = parsedContent.recipes;
    const recipeNames = new Set();
    
    recipes.forEach((recipe, index) => {
      if (!validateRecipe(recipe)) {
        throw new Error(`Structure invalide pour la recette ${index + 1}`);
      }
      if (recipeNames.has(recipe.name)) {
        throw new Error('Les recettes doivent avoir des noms uniques');
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