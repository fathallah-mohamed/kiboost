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

  const breakfastSuggestions = filters.mealType === 'breakfast' && filters.maxPrepTime <= 15
    ? `\nVoici une liste de suggestions de petit-déjeuner rapide. CHOISIS-EN 3 DIFFÉRENTES et DÉTAILLE-LES:
    - Smoothie bowl aux fruits rouges et granola
    - Overnight oats aux pommes et cannelle
    - Pancakes express à la banane
    - Toast à l'avocat et œuf poché
    - Yaourt grec aux fruits frais et miel
    - Wrap petit-déjeuner aux œufs brouillés
    - Muffin anglais au fromage frais et saumon
    - Porridge express aux fruits
    - Bol de quinoa sucré aux fruits secs
    - Crêpes express au fromage blanc
    - Sandwich petit-déjeuner express
    - Chia pudding aux fruits (préparé la veille)
    - Granola maison express aux noix
    - Gaufres express au yaourt
    - Bowl de fromage blanc aux fruits et graines`
    : '';

  return `Génère 3 recettes DIFFÉRENTES et CRÉATIVES pour enfant:
Age: ${child.birth_date}
${allergiesText}
${preferencesText}
${constraints.length ? 'Contraintes: ' + constraints.join(', ') : ''}
${breakfastSuggestions}

IMPORTANT:
- Les 3 recettes DOIVENT être DIFFÉRENTES
- Pour chaque recette, ajoute 3 bienfaits santé parmi: ${validCategories.join(', ')}
- Le temps de préparation doit être RÉALISTE (inclure préparation + cuisson)
- Utilise des ingrédients simples et prêts à l'emploi
- Les étapes doivent être courtes et efficaces
- UTILISE UNIQUEMENT des guillemets doubles (") pour le JSON, PAS de guillemets simples (')

FORMAT JSON REQUIS (respecte EXACTEMENT ce format):
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
          content: 'Tu es un chef créatif spécialisé en recettes rapides pour enfants. Tu dois générer UNIQUEMENT un objet JSON valide avec une propriété "recipes" contenant un tableau de 3 recettes DIFFÉRENTES. Pas de texte avant ou après, uniquement du JSON avec des guillemets doubles.' 
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
      const parsedContent = JSON.parse(content);
      
      if (!parsedContent.recipes || !Array.isArray(parsedContent.recipes)) {
        throw new Error('Format de réponse invalide: la propriété "recipes" est manquante ou n\'est pas un tableau');
      }

      const recipes = parsedContent.recipes;

      // Vérifier que nous avons bien 3 recettes
      if (recipes.length !== 3) {
        throw new Error(`Nombre incorrect de recettes: ${recipes.length} au lieu de 3`);
      }

      // Vérifier que les recettes sont différentes
      const recipeNames = new Set(recipes.map(r => r.name));
      if (recipeNames.size !== recipes.length) {
        throw new Error('Les recettes doivent être différentes');
      }

      // Validation de la structure de chaque recette
      recipes.forEach((recipe, index) => {
        if (!recipe.name || !Array.isArray(recipe.ingredients) || !Array.isArray(recipe.instructions)) {
          throw new Error(`Structure invalide pour la recette ${index + 1}`);
        }
        
        // Validation des champs obligatoires
        const requiredFields = ['name', 'ingredients', 'instructions', 'nutritional_info', 'meal_type', 'preparation_time', 'difficulty', 'servings', 'health_benefits'];
        const missingFields = requiredFields.filter(field => !recipe[field]);
        
        if (missingFields.length > 0) {
          throw new Error(`Champs manquants pour la recette ${index + 1}: ${missingFields.join(', ')}`);
        }
      });

      // Mélanger les recettes de manière aléatoire
      const shuffledRecipes = recipes.sort(() => Math.random() - 0.5);

      return new Response(
        JSON.stringify({ recipes: shuffledRecipes }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );

    } catch (parseError) {
      console.error('JSON parsing error:', parseError, '\nContent:', content);
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