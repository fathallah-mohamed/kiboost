import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.2.1';
import { corsHeaders } from '../_shared/cors.ts';

// Constants
const VALID_CATEGORIES = [
  'cognitive', 'energy', 'satiety', 'digestive', 'immunity',
  'growth', 'mental', 'organs', 'beauty', 'physical',
  'prevention', 'global'
];

const categoryMap: { [key: string]: string } = {
  'cognitif': 'cognitive',
  'énergie': 'energy',
  'satiété': 'satiety',
  'digestif': 'digestive',
  'immunité': 'immunity',
  'croissance': 'growth',
  'mental': 'mental',
  'organes': 'organs',
  'beauté': 'beauty',
  'physique': 'physical',
  'prévention': 'prevention',
  'global': 'global'
};

// Types
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
  healthBenefits?: string[];
  maxCost?: number;
  season?: number;
  specialOccasion?: string;
  includedIngredients?: string[];
  excludedIngredients?: string[];
}

// Helper Functions
const validateAndMapHealthBenefits = (healthBenefits: any[]) => {
  if (!Array.isArray(healthBenefits)) {
    console.error('Health benefits is not an array:', healthBenefits);
    return [];
  }

  return healthBenefits
    .map(benefit => {
      if (!benefit || typeof benefit.category !== 'string') {
        console.error('Invalid benefit format:', benefit);
        return null;
      }

      const mappedCategory = categoryMap[benefit.category] || benefit.category.toLowerCase();
      
      if (!VALID_CATEGORIES.includes(mappedCategory)) {
        console.error(`Invalid category found: ${benefit.category}, mapped to: ${mappedCategory}`);
        return null;
      }

      return {
        ...benefit,
        category: mappedCategory
      };
    })
    .filter(Boolean);
};

const generatePrompt = (childProfiles: ChildProfile[], filters: RecipeFilters) => {
  const child = childProfiles[0];
  const constraints = [];

  if (filters.mealType) constraints.push(`Type de repas : ${filters.mealType}`);
  if (filters.maxPrepTime) constraints.push(`Temps de préparation maximum : ${filters.maxPrepTime} minutes`);
  if (filters.difficulty) constraints.push(`Difficulté : ${filters.difficulty}`);
  if (filters.maxCost) constraints.push(`Coût maximum : ${filters.maxCost}€`);
  if (filters.season) constraints.push(`Mois : ${filters.season}`);
  if (filters.specialOccasion) constraints.push(`Occasion spéciale : ${filters.specialOccasion}`);
  
  const allergiesText = child.allergies?.length > 0 
    ? `Allergies à éviter : ${child.allergies.join(', ')}`
    : 'Aucune allergie connue';
    
  const preferencesText = child.preferences?.length > 0
    ? `Préférences alimentaires : ${child.preferences.join(', ')}`
    : 'Aucune préférence particulière';

  return `Génère 3 recettes pour enfants avec les caractéristiques suivantes :

Profil de l'enfant :
- Nom : ${child.name}
- Date de naissance : ${child.birth_date}
- ${allergiesText}
- ${preferencesText}

Contraintes :
${constraints.join('\n')}

Pour chaque recette, fournis :
- Un nom accrocheur
- Une liste d'ingrédients avec quantités
- Des instructions détaillées
- Le temps de préparation
- La difficulté
- Les informations nutritionnelles
- Les bienfaits santé (utilise uniquement ces catégories : cognitif, énergie, satiété, digestif, immunité, croissance, mental, organes, beauté, physique, prévention, global)

Format de réponse souhaité : un tableau JSON de recettes.`;
};

const processRecipes = (recipes: any[]) => {
  return recipes.map(recipe => {
    const healthBenefits = validateAndMapHealthBenefits(recipe.health_benefits);

    return {
      ...recipe,
      health_benefits: healthBenefits,
      ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
      instructions: Array.isArray(recipe.instructions) ? recipe.instructions : [recipe.instructions].filter(Boolean),
      nutritional_info: recipe.nutritional_info || {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      }
    };
  });
};

// Main Handler
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { childProfiles, filters } = await req.json();

    if (!childProfiles || !Array.isArray(childProfiles) || childProfiles.length === 0) {
      throw new Error('Profil enfant invalide ou manquant');
    }

    // Initialize OpenAI
    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiKey) {
      throw new Error('Clé API OpenAI manquante');
    }

    const configuration = new Configuration({ apiKey: openAiKey });
    const openai = new OpenAIApi(configuration);

    // Generate recipes
    const prompt = generatePrompt(childProfiles, filters || {});
    console.log('Prompt:', prompt);

    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    });

    let recipes;
    try {
      const content = completion.data.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Réponse OpenAI invalide');
      }
      recipes = JSON.parse(content);
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      throw new Error('Erreur lors du parsing de la réponse OpenAI');
    }

    // Process and validate recipes
    const processedRecipes = processRecipes(recipes);

    return new Response(
      JSON.stringify(processedRecipes),
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
        details: 'Une erreur est survenue lors de la génération des recettes. Veuillez réessayer.'
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 500,
      },
    );
  }
});