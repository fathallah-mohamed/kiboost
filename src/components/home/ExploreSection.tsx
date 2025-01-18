import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const ExploreSection = () => {
  return (
    <section className="container mx-auto px-4 py-16 text-center">
      <h2 className="text-3xl font-bold mb-6 animate-fade-in">
        Essayez Kiboost gratuitement, sans inscription !
      </h2>
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto">
          <Link to="/explore/recipes">Explorer les recettes</Link>
        </Button>
        <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto">
          <Link to="/explore/planner">Découvrir le planificateur</Link>
        </Button>
      </div>
    </section>
  );
};