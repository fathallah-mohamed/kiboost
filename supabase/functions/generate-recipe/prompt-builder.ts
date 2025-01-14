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

Exemple de format JSON REQUIS pour chaque recette:
[
  {
    "name": "Pancakes aux bananes",
    "ingredients": [
      {
        "item": "Banane mûre",
        "quantity": "2",
        "unit": "pièces"
      },
      {
        "item": "Farine",
        "quantity": "150",
        "unit": "g"
      }
    ],
    "instructions": [
      "Écraser les bananes",
      "Mélanger avec la farine"
    ],
    "nutritional_info": {
      "calories": 250,
      "protein": 5,
      "carbs": 45,
      "fat": 6
    },
    "meal_type": "breakfast",
    "preparation_time": 15,
    "difficulty": "easy",
    "servings": 4,
    "health_benefits": [
      {
        "category": "energy",
        "description": "Riche en glucides pour l'énergie",
        "icon": "zap"
      }
    ]
  }
]

${allAllergies.length > 0 ? `ALLERGIES À EXCLURE: ${allAllergies.join(', ')}` : ''}
${commonPreferences.length > 0 ? `PRÉFÉRENCES: ${commonPreferences.join(', ')}` : ''}

IMPORTANT:
- Réponds UNIQUEMENT avec un tableau JSON de 3 recettes
- Assure-toi que chaque recette a TOUS les champs requis
- Utilise UNIQUEMENT les valeurs autorisées pour meal_type (breakfast, lunch, dinner, snack), difficulty (easy, medium, hard) et les icônes (brain, zap, cookie, shield, leaf, lightbulb, battery, apple, heart, sun, dumbbell, sparkles)
- Génère des recettes DIFFÉRENTES à chaque fois (offset: ${offset})
- Adapte les portions et textures selon l'âge des enfants
- Privilégie des ingrédients sains et adaptés aux enfants`;
}