import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.2.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const VALID_CATEGORIES = [
  'cognitive', 'energy', 'satiety', 'digestive', 'immunity',
  'growth', 'mental', 'organs', 'beauty', 'physical',
  'prevention', 'global'
];

const generatePrompt = (child: any, filters: any, existingRecipes: any[]) => {
  console.log('Generating prompt for child:', child);
  console.log('Existing recipes:', existingRecipes);
  
  const allergiesText = child.allergies?.length > 0 
    ? `Allergies à éviter : ${child.allergies.join(', ')}`
    : 'Aucune allergie connue';
    
  const preferencesText = child.preferences?.length > 0
    ? `Préférences alimentaires : ${child.preferences.join(', ')}`
    : 'Aucune préférence particulière';

  const existingRecipeNames = existingRecipes.map(r => r.name).join(', ');

  return `Génère UNIQUEMENT un objet JSON valide (sans formatage markdown) contenant 3 recettes UNIQUES et TRÈS DIFFÉRENTES des recettes existantes suivantes: ${existingRecipeNames}

Age: ${child.birth_date}
${allergiesText}
${preferencesText}

RÈGLES IMPORTANTES:
- Les recettes DOIVENT être COMPLÈTEMENT DIFFÉRENTES des recettes existantes listées ci-dessus
- Les 3 recettes DOIVENT être COMPLÈTEMENT DIFFÉRENTES entre elles (pas de variations sur un même thème)
- ÉVITE ABSOLUMENT les recettes similaires ou avec les mêmes ingrédients principaux
- DIVERSIFIE au maximum les ingrédients principaux entre les recettes
- VARIE les textures et les modes de préparation
- Pour chaque recette, ajoute 3 bienfaits santé parmi UNIQUEMENT: ${VALID_CATEGORIES.join(', ')}
- Les icônes doivent être parmi: brain, energy, heart, shield, leaf, sun, sparkles
- Le temps de préparation doit être RÉALISTE
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
      "meal_type": "dinner",
      "preparation_time": 30,
      "difficulty": "medium",
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
    const { child, filters, existingRecipes } = await req.json();
    console.log('Generating recipes for:', { child, filters, existingRecipes });

    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiKey) throw new Error('OpenAI API key missing');

    const configuration = new Configuration({ apiKey: openAiKey });
    const openai = new OpenAIApi(configuration);

    const prompt = generatePrompt(child, filters, existingRecipes);
    console.log('Using prompt:', prompt);

    const completion = await openai.createChatCompletion({
      model: 'gpt-4o',
      messages: [
        { 
          role: 'system', 
          content: 'Tu es un chef créatif spécialisé en recettes pour enfants. Tu dois générer UNIQUEMENT un objet JSON valide avec des recettes UNIQUES et DIFFÉRENTES des recettes existantes.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.9,
      max_tokens: 2000,
    });

    const content = completion.data.choices[0]?.message?.content;
    if (!content) throw new Error('Réponse OpenAI invalide');

    console.log('Raw OpenAI response:', content);

    try {
      const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
      const parsedContent = JSON.parse(cleanedContent);
      
      if (!parsedContent.recipes || !Array.isArray(parsedContent.recipes)) {
        throw new Error('Format de réponse invalide');
      }

      // Validate health benefit categories
      const recipes = parsedContent.recipes.map((recipe: any) => ({
        ...recipe,
        health_benefits: recipe.health_benefits?.map((benefit: any) => ({
          ...benefit,
          category: VALID_CATEGORIES.includes(benefit.category) ? benefit.category : 'global',
          icon: ['brain', 'energy', 'heart', 'shield', 'leaf', 'sun', 'sparkles'].includes(benefit.icon) 
            ? benefit.icon 
            : 'sparkles'
        }))
      }));

      console.log('Validated recipes:', recipes);

      return new Response(
        JSON.stringify({ recipes }),
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