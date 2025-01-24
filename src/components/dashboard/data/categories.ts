import { Category } from "../types/category";

export const categories: Category[] = [
  {
    id: "recipes",
    title: "Recettes",
    slogan: "Boostez vos repas !",
    description: "Trouvez des idées de repas simples, rapides et savoureuses pour toute la famille.",
    isActive: true,
    icon: "Utensils",
    route: "/dashboard"
  },
  {
    id: "sports",
    title: "Activités sportives",
    slogan: "Boostez votre énergie !",
    description: "Restez actif en famille avec des idées sportives pour tous.",
    isActive: false,
    icon: "Dumbbell",
    comingSoonMessage: "Cette catégorie sera bientôt disponible. Restez à l'écoute !"
  },
  {
    id: "family",
    title: "Activités en famille/enfants",
    slogan: "Boostez vos moments partagés !",
    description: "Créez des souvenirs inoubliables avec des idées ludiques et créatives.",
    isActive: false,
    icon: "Users",
    comingSoonMessage: "Cette fonctionnalité est en cours de développement."
  },
  {
    id: "meetings",
    title: "Rencontres entre familles",
    slogan: "Boostez vos connexions sociales !",
    description: "Rencontrez d'autres familles pour des moments conviviaux.",
    isActive: false,
    icon: "Heart",
    comingSoonMessage: "Cette fonctionnalité sera bientôt disponible."
  },
  {
    id: "education",
    title: "Éducation ludique",
    slogan: "Boostez l'apprentissage de vos enfants !",
    description: "Apprendre en s'amusant avec des activités éducatives et créatives.",
    isActive: false,
    icon: "BookOpen",
    comingSoonMessage: "Cette catégorie sera disponible prochainement. Merci de votre patience !"
  },
  {
    id: "events",
    title: "Sorties et événements",
    slogan: "Boostez vos sorties !",
    description: "Trouvez des idées de sorties et d'événements près de chez vous.",
    isActive: false,
    icon: "Ticket",
    comingSoonMessage: "Cette catégorie sera disponible bientôt !"
  },
  {
    id: "wellness",
    title: "Bien-être familial",
    slogan: "Boostez votre équilibre !",
    description: "Prenez soin de vous et de votre famille avec nos conseils bien-être.",
    isActive: false,
    icon: "Heart",
    comingSoonMessage: "Cette fonctionnalité est en cours de développement."
  },
  {
    id: "travel",
    title: "Voyages en famille",
    slogan: "Boostez vos aventures !",
    description: "Organisez vos voyages et vos sorties avec vos enfants.",
    isActive: false,
    icon: "Plane",
    comingSoonMessage: "Cette fonctionnalité est en cours de développement."
  }
];
