import { Heart, Calendar, Salad } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: <Heart className="w-12 h-12 text-primary" />,
    title: "Recettes personnalisées",
    description: "Des recettes adaptées aux goûts et besoins de vos enfants."
  },
  {
    icon: <Calendar className="w-12 h-12 text-primary" />,
    title: "Planification facile",
    description: "Un calendrier interactif pour organiser vos repas de la semaine."
  },
  {
    icon: <Salad className="w-12 h-12 text-primary" />,
    title: "Nutrition équilibrée",
    description: "Des repas sains pour toute la famille, en quelques clics."
  }
];

export const FeaturesSection = () => {
  return (
    <section className="container mx-auto px-4 py-16 bg-white/50">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <Card 
            key={index}
            className="p-6 text-center hover:shadow-lg transition-shadow animate-fade-in [animation-delay:600ms] bg-white/80 backdrop-blur-sm"
          >
            <div className="mb-4 flex justify-center">{feature.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </Card>
        ))}
      </div>
    </section>
  );
};