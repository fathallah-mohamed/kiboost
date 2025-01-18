import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const HeroSection = () => {
  return (
    <section className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">
        Simplifiez vos repas et rendez vos enfants heureux,{" "}
        <span className="text-primary">grâce à l'IA !</span>
      </h1>
      <p className="text-xl md:text-2xl mb-8 text-gray-600 max-w-2xl mx-auto animate-fade-in [animation-delay:200ms]">
        Créez des profils, générez des recettes adaptées, et planifiez vos repas en toute simplicité.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in [animation-delay:400ms]">
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link to="/signup">Créer un compte gratuitement</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
          <Link to="/login">Se connecter</Link>
        </Button>
      </div>
    </section>
  );
};