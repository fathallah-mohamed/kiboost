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

  const mealTypePrompt = filters?.mealType ? `pour le ${filters.mealType}` : 'pour n\'importe quel repas';
  const difficultyPrompt = filters?.difficulty ? `de difficulté ${filters.difficulty}` : '';
  const timePrompt = filters?.maxPrepTime ? `qui se prépare en moins de ${filters.maxPrepTime} minutes` : '';

  return `En tant que chef cuisinier et pédiatre nutritionniste français spécialisé dans l'alimentation multi-âges, crée 3 recettes exceptionnelles, gourmandes et équilibrées ${mealTypePrompt} ${difficultyPrompt} ${timePrompt} pour ${childProfiles.length} enfant(s) âgés de ${ageRange.min} à ${ageRange.max} ans.
    
    IMPORTANT: Génère des recettes DIFFÉRENTES à chaque fois, ne répète pas les mêmes recettes.
    Utilise ton imagination pour créer des recettes uniques et variées.
    Offset actuel: ${offset} (utilise cet offset pour générer des recettes différentes)

    ${allAllergies.length > 0 ? `⚠️ SÉCURITÉ ALIMENTAIRE CRITIQUE - ALLERGIES :
    - Exclus ABSOLUMENT et STRICTEMENT ces allergènes pour TOUS les enfants : ${allAllergies.join(', ')}
    - Vérifie TOUS les ingrédients pour éviter les contaminations croisées
    - Propose des alternatives sûres pour les ingrédients allergènes` : ''}

    ${commonPreferences.length > 0 ? `✨ PRÉFÉRENCES PARTAGÉES :
    - Privilégie ces ingrédients appréciés par TOUS les enfants : ${commonPreferences.join(', ')}
    - Adapte les recettes pour maximiser l'utilisation de ces ingrédients favoris communs` : ''}
    
    CRITÈRES ESSENTIELS pour chaque recette :
    1. 🧒 ADAPTATION MULTI-ÂGES (${ageRange.min}-${ageRange.max} ans)
       - Portions et textures adaptables selon l'âge
       - Instructions spécifiques pour adapter aux différents âges si nécessaire
    
    2. 🍎 SÉCURITÉ ET NUTRITION
       - Ingrédients frais et sains
       - Portions adaptées aux besoins nutritionnels de chaque âge
       - Équilibre nutritionnel optimal pour la tranche d'âge
    
    3. 👩‍🍳 PRATICITÉ ET PARTICIPATION
       - Instructions simples et claires
       - Étapes adaptées pour faire participer les enfants selon leur âge
       - Temps de préparation réaliste pour une famille
    
    4. 🎨 ASPECT LUDIQUE ET ATTRACTIF
       - Présentation attrayante pour tous les âges
       - Couleurs et formes amusantes
       - Noms créatifs et amusants
    
    5. 🧠 DÉVELOPPEMENT ET SANTÉ
       - Ingrédients favorisant le développement cognitif
       - Superaliments adaptés à chaque âge
       - Combinaisons d'aliments optimisant l'absorption des nutriments
    
    6. 👥 PERSONNALISATION MULTI-ENFANTS
       - Possibilité d'adapter les portions/textures selon l'âge
       - Options de personnalisation respectant les préférences communes
       - Suggestions de variations pour satisfaire les différents goûts

    TRÈS IMPORTANT : Pour chaque recette, fournis une liste de 3 à 5 bienfaits santé spécifiques parmi ces catégories :
    - cognitive: bienfaits pour le cerveau et la concentration
    - energy: apport en énergie et vitalité
    - satiety: satiété et contrôle de l'appétit
    - digestive: santé digestive
    - immunity: renforcement du système immunitaire
    - growth: croissance et développement
    - mental: bien-être mental et émotionnel
    - organs: santé des organes
    - beauty: santé de la peau et des cheveux
    - physical: force et endurance physique
    - prevention: prévention des maladies
    - global: santé globale

    Pour chaque bienfait, fournis :
    - category: la catégorie (parmi la liste ci-dessus)
    - description: une description courte et ludique du bienfait
    - icon: une icône parmi : brain, zap, cookie, shield, leaf, lightbulb, battery, apple, heart, sun, dumbbell, sparkles`;
}