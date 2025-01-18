import { BookOpen, Calendar, Users, Heart, ShoppingCart, Sparkles } from "lucide-react";
import { FeatureCard } from "./FeatureCard";

export const FeaturesSection = () => {
  const features = [
    {
      icon: <BookOpen className="w-8 h-8 text-primary" />,
      title: "Recettes personnalisées",
      description: "Trouvez des idées adaptées à vos enfants",
    },
    {
      icon: <Calendar className="w-8 h-8 text-primary" />,
      title: "Planificateur",
      description: "Organisez vos repas et gagnez du temps",
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: "Profils enfants",
      description: "Suivez les besoins de chacun de vos enfants",
    },
    {
      icon: <ShoppingCart className="w-8 h-8 text-primary" />,
      title: "Liste de courses",
      description: "Générez automatiquement votre liste",
    },
    {
      icon: <Heart className="w-8 h-8 text-primary" />,
      title: "Favoris",
      description: "Sauvegardez vos recettes préférées",
    },
    {
      icon: <Sparkles className="w-8 h-8 text-primary" />,
      title: "Premium",
      description: "Accédez à toutes les fonctionnalités",
      soon: true,
    },
  ];

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>
    </section>
  );
};