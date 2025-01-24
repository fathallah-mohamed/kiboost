import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.2.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const generatePrompt = (child: any, filters: any) => {
  console.log('Generating prompt for child:', child);
  
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
  if (filters.maxCost) {
    constraints.push(`Coût maximum par portion : ${filters.maxCost}€`);
  }
  if (filters.healthBenefits?.length > 0) {
    constraints.push(`Bienfaits santé souhaités : ${filters.healthBenefits.join(', ')}`);
  }
  if (filters.season) {
    constraints.push(`Saison : ${filters.season}`);
  }

  return `Retourne UNIQUEMENT un objet JSON valide (sans formatage markdown) contenant 3 recettes UNIQUES et TRÈS DIFFÉRENTES les unes des autres pour petit-déjeuner:
Age: ${child.birth_date}
${allergiesText}
${preferencesText}
${constraints.length ? 'Contraintes: ' + constraints.join(', ') : ''}

RÈGLES IMPORTANTES:
- Les 3 recettes DOIVENT être COMPLÈTEMENT DIFFÉRENTES (pas de variations sur un même thème)
- ÉVITE les recettes trop similaires (ex: ne pas faire plusieurs smoothies ou plusieurs types de porridge)
- DIVERSIFIE les ingrédients principaux entre les recettes
- VARIE les textures et les modes de préparation
- Pour chaque recette, ajoute 3 bienfaits santé parmi: ${validCategories.join(', ')}
- Le temps de préparation doit être RÉALISTE et respecter la contrainte de temps
- Utilise des ingrédients simples et prêts à l'emploi
- Les étapes doivent être courtes et efficaces
- UTILISE UNIQUEMENT des guillemets doubles (") pour le JSON
- RETOURNE UNIQUEMENT L'OBJET JSON, PAS DE TEXTE AVANT OU APRÈS

FORMAT JSON REQUIS:
{
  "recipes": [
    {
      "name": "Nom de la recette",
      "ingredients": [
        {
          "item": "Ingrédient",
          "quantity": "Quantité",
          "unit": "Unité"
        }
      ],
      "instructions": [
        "Étape 1",
        "Étape 2"
      ],
      "nutritional_info": {
        "calories": 0,
        "protein": 0,
        "carbs": 0,
        "fat": 0
      },
      "meal_type": "breakfast",
      "preparation_time": 15,
      "difficulty": "easy",
      "servings": 4,
      "health_benefits": [
        {
          "icon": "brain",
          "category": "cognitive",
          "description": "Description du bienfait"
        }
      ]
    }
  ]
}`;
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
          content: 'Tu es un chef créatif spécialisé en recettes pour enfants. Tu dois générer UNIQUEMENT un objet JSON valide (sans formatage markdown) avec des recettes UNIQUES et DIFFÉRENTES les unes des autres. Évite absolument les répétitions ou les variations sur un même thème.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 1.2,
      max_tokens: 2000,
    });

    const content = completion.data.choices[0]?.message?.content;
    if (!content) throw new Error('Réponse OpenAI invalide');

    console.log('Raw OpenAI response:', content);

    try {
      // Remove any potential markdown formatting
      const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
      const parsedContent = JSON.parse(cleanedContent);
      
      if (!parsedContent.recipes || !Array.isArray(parsedContent.recipes)) {
        throw new Error('Format de réponse invalide');
      }

      const recipes = parsedContent.recipes;
      console.log('Parsed recipes:', recipes);

      // Vérification supplémentaire pour s'assurer que les recettes sont uniques
      const uniqueRecipes = recipes.filter((recipe, index, self) =>
        index === self.findIndex((r) => (
          r.name.toLowerCase().includes(recipe.name.toLowerCase()) ||
          recipe.name.toLowerCase().includes(r.name.toLowerCase())
        ))
      );

      return new Response(
        JSON.stringify({ recipes: uniqueRecipes }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );

    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
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