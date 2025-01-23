import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

// Valid categories as defined in the database validation function
const VALID_CATEGORIES = [
  'cognitive',
  'energy',
  'satiety',
  'digestive',
  'immunity',
  'growth',
  'mental',
  'organs',
  'beauty',
  'physical',
  'prevention',
  'global'
];

// Map French categories to valid database categories
const categoryMap: { [key: string]: string } = {
  'Énergie': 'energy',
  'Cognitive': 'cognitive',
  'Satiété': 'satiety',
  'Digestif': 'digestive',
  'Digestive': 'digestive',
  'Immunité': 'immunity',
  'Croissance': 'growth',
  'Mental': 'mental',
  'Organes': 'organs',
  'Beauté': 'beauty',
  'Physique': 'physical',
  'Prévention': 'prevention',
  'Global': 'global'
};

function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('Clé API OpenAI non configurée');
    }

    const { childProfiles, filters } = await req.json();
    const child = childProfiles[0];
    
    console.log("Génération de recettes pour l'enfant:", child, "avec les filtres:", filters);

    const prompt = `Génère exactement 3 recettes uniques et saines adaptées à un enfant de ${calculateAge(child.birth_date)} ans.
    Prends en compte ces préférences : ${child.preferences?.join(", ") || "aucune préférence spécifique"}
    Évite ces allergènes : ${child.allergies?.join(", ") || "aucune allergie"}
    
    Filtres supplémentaires :
    - Type de repas : ${filters?.mealType || "tous"}
    - Temps de préparation maximum : ${filters?.maxPrepTime || "non spécifié"} minutes
    - Niveau de difficulté : ${filters?.difficulty || "tous"}
    
    Pour chaque recette, inclus exactement 3 bienfaits pour la santé parmi ces catégories :
    - cognitive : amélioration de la mémoire, concentration
    - energy : boost d'énergie, vitalité
    - satiety : satiété prolongée
    - digestive : santé digestive
    - immunity : renforcement immunitaire
    - growth : croissance, développement
    - mental : bien-être mental
    - organs : santé des organes
    - beauty : santé de la peau
    - physical : performance physique
    - prevention : prévention santé
    - global : santé globale
    
    Utilise ces icônes : brain, zap, cookie, shield, leaf, lightbulb, battery, apple, heart, sun, dumbbell, sparkles
    
    Retourne UNIQUEMENT un tableau JSON valide contenant exactement 3 objets de recette.`;

    console.log("Envoi du prompt à OpenAI:", prompt);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { 
            role: 'system', 
            content: 'Tu es un assistant culinaire français qui génère des recettes adaptées aux enfants. Réponds toujours en français et retourne uniquement du JSON valide contenant exactement 3 objets de recette. N\'inclus jamais de formatage markdown ou de texte supplémentaire.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Erreur API OpenAI:", error);
      throw new Error('Échec de la génération des recettes depuis OpenAI');
    }

    const data = await response.json();
    const recipesText = data.choices[0].message.content;
    console.log("Réponse brute d'OpenAI:", recipesText);

    const cleanedText = recipesText.replace(/```json\n|\n```/g, '').trim();
    console.log("Réponse nettoyée:", cleanedText);

    let recipes;
    try {
      recipes = JSON.parse(cleanedText);
      
      if (!Array.isArray(recipes) || recipes.length !== 3) {
        throw new Error("Format de réponse invalide : tableau de 3 recettes attendu");
      }

      const difficultyMap: { [key: string]: string } = {
        'facile': 'easy',
        'moyen': 'medium',
        'difficile': 'hard'
      };

      const mealTypeMap: { [key: string]: string } = {
        'petit-déjeuner': 'breakfast',
        'déjeuner': 'lunch',
        'dîner': 'dinner',
        'collation': 'snack'
      };

      recipes = recipes.map(recipe => {
        // Ensure health_benefits exists and is an array
        const healthBenefits = Array.isArray(recipe.health_benefits) ? recipe.health_benefits : [];
        
        // Validate and map health benefits
        const mappedHealthBenefits = healthBenefits.map((benefit: any) => {
          if (!benefit || typeof benefit.category !== 'string') {
            console.error('Invalid benefit format:', benefit);
            return null;
          }

          // Get the correct category from the map or try to use the lowercase version
          const mappedCategory = categoryMap[benefit.category] || benefit.category.toLowerCase();
          
          // Verify the category is valid
          if (!VALID_CATEGORIES.includes(mappedCategory)) {
            console.error(`Invalid category found: ${benefit.category}, mapped to: ${mappedCategory}`);
            return null;
          }

          return {
            ...benefit,
            category: mappedCategory
          };
        }).filter(Boolean); // Remove any null values

        return {
          ...recipe,
          difficulty: difficultyMap[recipe.difficulty.toLowerCase()] || recipe.difficulty,
          meal_type: mealTypeMap[recipe.meal_type.toLowerCase()] || recipe.meal_type,
          health_benefits: mappedHealthBenefits,
          is_generated: true,
          image_url: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9",
        };
      });

    } catch (parseError) {
      console.error("Erreur d'analyse JSON:", parseError);
      throw new Error(`Erreur d'analyse JSON: ${parseError.message}`);
    }

    return new Response(JSON.stringify(recipes), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Erreur dans la fonction generate-recipe:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        details: "Une erreur est survenue lors de la génération des recettes. Veuillez réessayer."
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});