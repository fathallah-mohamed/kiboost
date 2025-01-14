import { ChildProfile, RecipeFilters } from './types.ts';

export function buildPrompt(
  childProfiles: ChildProfile[],
  filters: RecipeFilters = {},
  offset: number = 0
): string {
  const allAllergies = [...new Set(childProfiles.flatMap(child => child.allergies || []))];
  const commonPreferences = childProfiles.reduce((common, child) => {
    if (common.length === 0) return child.preferences || [];
    return common.filter(pref => (child.preferences || []).includes(pref));
  }, [] as string[]);

  const ageRange = {
    min: Math.min(...childProfiles.map(child => child.age)),
    max: Math.max(...childProfiles.map(child => child.age))
  };

  const mealTypePrompt = filters?.mealType ? `pour le ${filters.mealType}` : '';
  const difficultyPrompt = filters?.difficulty ? `de difficulté ${filters.difficulty}` : '';
  const timePrompt = filters?.maxPrepTime ? `qui se prépare en moins de ${filters.maxPrepTime} minutes` : '';

  return `Génère exactement 3 recettes ${mealTypePrompt} ${difficultyPrompt} ${timePrompt} pour ${childProfiles.length} enfant(s) âgés de ${ageRange.min} à ${ageRange.max} ans.

Format JSON REQUIS pour chaque recette:
{
  "name": "Nom de la recette",
  "ingredients": [
    {
      "item": "Ingrédient",
      "quantity": "Quantité",
      "unit": "Unité"
    }
  ],
  "instructions": ["Étape 1", "Étape 2", "..."],
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
      "category": "cognitive|energy|satiety|digestive|immunity|growth|mental|organs|beauty|physical|prevention|global",
      "description": "Description du bienfait",
      "icon": "brain|zap|cookie|shield|leaf|lightbulb|battery|apple|heart|sun|dumbbell|sparkles"
    }
  ]
}

${allAllergies.length > 0 ? `ALLERGIES À EXCLURE: ${allAllergies.join(', ')}` : ''}
${commonPreferences.length > 0 ? `PRÉFÉRENCES: ${commonPreferences.join(', ')}` : ''}

IMPORTANT:
- Réponds UNIQUEMENT avec un tableau JSON de 3 recettes
- Assure-toi que chaque recette a TOUS les champs requis
- Utilise UNIQUEMENT les valeurs autorisées pour meal_type, difficulty et les icônes
- Génère des recettes DIFFÉRENTES à chaque fois (offset: ${offset})
- Adapte les portions et textures selon l'âge des enfants
- Privilégie des ingrédients sains et adaptés aux enfants`;
}