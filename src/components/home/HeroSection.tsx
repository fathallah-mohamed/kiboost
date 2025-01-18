import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { AuthForm } from "@/components/auth/AuthForm";

export const HeroSection = () => {
  return (
    <section className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 animate-fade-in">
        Simplifiez vos repas, vos courses et vos activités
        <span className="text-primary">.</span>
      </h1>
      <p className="text-xl md:text-2xl mb-8 text-muted-foreground max-w-2xl mx-auto animate-fade-in [animation-delay:200ms]">
        Tout en un seul endroit !
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in [animation-delay:400ms]">
        <AuthForm />
        <Button variant="outline" size="lg" className="gap-2 group" asChild>
          <Link to="/demo">
            Explorer sans inscription
            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </div>
    </section>
  );
};