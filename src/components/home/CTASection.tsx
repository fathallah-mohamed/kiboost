import { Button } from "@/components/ui/button";

export const CTASection = () => (
  <section className="bg-primary/5 py-20 mt-16">
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-3xl font-bold mb-6">Prêt à révolutionner vos repas ?</h2>
      <p className="text-xl mb-8 text-muted-foreground max-w-2xl mx-auto">
        Rejoignez des milliers de parents qui font confiance à Kiboost pour simplifier leur quotidien.
      </p>
      <Button 
        size="lg" 
        className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 py-6 text-lg animate-float"
      >
        Commencer gratuitement
      </Button>
    </div>
  </section>
);