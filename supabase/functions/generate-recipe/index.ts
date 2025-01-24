import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.2.1';

interface ChildProfile {
  id: string;
  name: string;
  birth_date: string;
  allergies: string[];
  preferences: string[];
}

interface RecipeFilters {
  mealType?: string;
  maxPrepTime?: number;
  difficulty?: string;
  dietaryPreferences?: string[];
  excludedAllergens?: string[];
  maxCost?: number;
  healthBenefits?: string[];
  season?: number;
  includedIngredients?: string[];
  excludedIngredients?: string[];
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const VALID_HEALTH_CATEGORIES = [
  'cognitive', 'energy', 'satiety', 'digestive', 'immunity',
  'growth', 'mental', 'organs', 'beauty', 'physical',
  'prevention', 'global'
] as const;

const generatePrompt = (child: ChildProfile, filters: RecipeFilters) => {
  const allergiesText = child.allergies?.length > 0 
    ? `Allergies à éviter : ${child.allergies.join(', ')}`
    : 'Aucune allergie connue';
    
  const preferencesText = child.preferences?.length > 0
    ? `Préférences alimentaires : ${child.preferences.join(', ')}`
    : 'Aucune préférence particulière';

  const validCategoriesText = VALID_HEALTH_CATEGORIES.join(', ');

  let additionalConstraints = [];
  
  if (filters.mealType && filters.mealType !== 'all') {
    additionalConstraints.push(`- Type de repas : ${filters.mealType}`);
  }
  
  if (filters.maxPrepTime) {
    additionalConstraints.push(`- Temps de préparation maximum : ${filters.maxPrepTime} minutes`);
  }
  
  if (filters.difficulty && filters.difficulty !== 'all') {
    additionalConstraints.push(`- Niveau de difficulté : ${filters.difficulty}`);
  }
  
  if (filters.maxCost) {
    additionalConstraints.push(`- Coût maximum par portion : ${filters.maxCost}€`);
  }

  if (filters.includedIngredients?.length) {
    additionalConstraints.push(`- Ingrédients à inclure : ${filters.includedIngredients.join(', ')}`);
  }

  if (filters.excludedIngredients?.length) {
    additionalConstraints.push(`- Ingrédients à exclure : ${filters.excludedIngredients.join(', ')}`);
  }

  if (filters.season) {
    const month = new Date(2024, filters.season - 1).toLocaleString('fr-FR', { month: 'long' });
    additionalConstraints.push(`- Recette de saison pour : ${month}`);
  }

  if (filters.healthBenefits?.length) {
    additionalConstraints.push(`- Bienfaits santé requis : ${filters.healthBenefits.join(', ')}`);
  }

  const constraintsText = additionalConstraints.length > 0 
    ? `\nContraintes supplémentaires :\n${additionalConstraints.join('\n')}`
    : '';

  return `Génère 3 recettes pour enfants adaptées au profil suivant :

Profil de l'enfant :
- Nom : ${child.name}
- Date de naissance : ${child.birth_date}
- ${allergiesText}
- ${preferencesText}
${constraintsText}

IMPORTANT : 
- Chaque recette DOIT avoir EXACTEMENT 3 bienfaits santé différents
- Les catégories de bienfaits santé DOIVENT être UNIQUEMENT parmi : ${validCategoriesText}
- NE PAS inventer d'autres catégories
- Respecter STRICTEMENT toutes les contraintes données

Réponds UNIQUEMENT avec un tableau JSON contenant exactement 3 recettes au format suivant :
[
  {
    "name": "Nom de la recette",
    "ingredients": [
      {
        "item": "Nom de l'ingrédient",
        "quantity": "Quantité",
        "unit": "Unité"
      }
    ],
    "instructions": ["Étape 1", "Étape 2"],
    "nutritional_info": {
      "calories": 0,
      "protein": 0,
      "carbs": 0,
      "fat": 0
    },
    "meal_type": "breakfast|lunch|dinner|snack",
    "preparation_time": 30,
    "difficulty": "easy|medium|hard",
    "servings": 4,
    "health_benefits": [
      {
        "icon": "brain|heart|etc",
        "category": "cognitive|energy|immunity|etc",
        "description": "Description du bénéfice"
      }
    ]
  }
]`;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { child, filters } = await req.json();
    console.log('Received child profile:', child);
    console.log('Received filters:', filters);

    if (!child || !child.name || !child.birth_date) {
      throw new Error('Profil enfant invalide ou manquant');
    }

    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiKey) {
      throw new Error('Clé API OpenAI manquante');
    }

    const configuration = new Configuration({ apiKey: openAiKey });
    const openai = new OpenAIApi(configuration);

    const prompt = generatePrompt(child, filters);
    console.log('Generated prompt:', prompt);

    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        { 
          role: 'system', 
          content: 'Tu es un chef cuisinier spécialisé dans la création de recettes pour enfants. Tu dois UNIQUEMENT répondre avec un tableau JSON valide contenant exactement 3 recettes. Chaque recette DOIT avoir EXACTEMENT 3 bienfaits santé différents. Ne réponds JAMAIS avec du texte avant ou après le JSON.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = completion.data.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Réponse OpenAI invalide - contenu manquant');
    }

    console.log('Raw OpenAI response:', content);

    let recipes;
    try {
      const cleanContent = content
        .replace(/```json\n?|\n?```/g, '')
        .replace(/^[\s\n]*\[/, '[')
        .replace(/\][\s\n]*$/, ']')
        .trim();

      console.log('Cleaned content:', cleanContent);
      
      recipes = JSON.parse(cleanContent);
      
      if (!Array.isArray(recipes)) {
        throw new Error('La réponse n\'est pas un tableau');
      }
      
      if (recipes.length !== 3) {
        throw new Error('Le nombre de recettes est incorrect');
      }

      recipes.forEach((recipe, index) => {
        if (!recipe.name || !recipe.ingredients || !recipe.instructions) {
          throw new Error(`Format de recette invalide à l'index ${index}`);
        }
      });

      console.log('Successfully parsed and validated recipes:', recipes);
    } catch (error) {
      console.error('Error parsing or validating OpenAI response:', error);
      throw new Error(`Erreur lors du parsing ou de la validation de la réponse OpenAI: ${error.message}`);
    }

    return new Response(
      JSON.stringify({ recipes }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );

  } catch (error) {
    console.error('Error in generate-recipe function:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Une erreur inconnue est survenue',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
});