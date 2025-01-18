import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export const PremiumTeaser = () => {
  return (
    <section className="container mx-auto px-4 py-16">
      <Card className="p-8 text-center bg-gradient-to-r from-secondary/20 to-primary/20 backdrop-blur-sm">
        <div className="flex justify-center mb-4">
          <Sparkles className="w-12 h-12 text-primary animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold mb-4">Bientôt disponible : Kiboost Premium</h2>
        <p className="text-lg text-gray-600">
          Profitez de recettes exclusives, profils illimités, et plus encore.
        </p>
      </Card>
    </section>
  );
};