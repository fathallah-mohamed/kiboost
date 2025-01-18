import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    
    Pour chaque recette, inclus 3-5 bienfaits spécifiques pour la santé des enfants, en choisissant parmi ces catégories :
    1. Cognitive : amélioration de la mémoire, stimulation de la créativité, concentration accrue
    2. Énergie : boost d'énergie, réduction de la fatigue, énergie rapide
    3. Satiété : satiété prolongée, régulation de l'appétit
    4. Digestive : amélioration de la digestion, santé intestinale, réduction des ballonnements
    5. Immunité : renforcement du système immunitaire, protection contre les maladies
    6. Croissance : renforcement des os, développement musculaire
    7. Mental : amélioration de l'humeur, réduction du stress, meilleur sommeil
    8. Organes : santé des yeux, protection cardiaque, santé respiratoire
    9. Beauté : santé de la peau et des cheveux, hydratation
    10. Physique : préparation à l'exercice, récupération, endurance
    11. Prévention : anti-âge, détox, équilibre nutritionnel
    12. Global : vitalité générale, nutrition durable

    Utilise ces icônes pour les bienfaits : brain, zap, cookie, shield, leaf, lightbulb, battery, apple, heart, sun, dumbbell, sparkles
    
    Retourne UNIQUEMENT un tableau JSON valide contenant exactement 3 objets de recette. Chaque objet de recette doit suivre exactement cette structure :
    {
      "name": "string",
      "ingredients": [{"item": "string", "quantity": "string", "unit": "string"}],
      "instructions": ["string"],
      "nutritional_info": {"calories": number, "protein": number, "carbs": number, "fat": number},
      "preparation_time": number,
      "difficulty": "facile/moyen/difficile",
      "meal_type": "petit-déjeuner/déjeuner/dîner/collation",
      "health_benefits": [{"icon": "string", "category": "string", "description": "string"}],
      "min_age": number,
      "max_age": number
    }`;

    console.log("Envoi du prompt à OpenAI:", prompt);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
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

      // Conversion des niveaux de difficulté en anglais pour la base de données
      const difficultyMap: { [key: string]: string } = {
        'facile': 'easy',
        'moyen': 'medium',
        'difficile': 'hard'
      };

      // Conversion des types de repas en anglais pour la base de données
      const mealTypeMap: { [key: string]: string } = {
        'petit-déjeuner': 'breakfast',
        'déjeuner': 'lunch',
        'dîner': 'dinner',
        'collation': 'snack'
      };

      recipes = recipes.map(recipe => ({
        ...recipe,
        difficulty: difficultyMap[recipe.difficulty.toLowerCase()] || recipe.difficulty,
        meal_type: mealTypeMap[recipe.meal_type.toLowerCase()] || recipe.meal_type,
        is_generated: true,
        image_url: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9",
      }));

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