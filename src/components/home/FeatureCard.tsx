import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  soon?: boolean;
}

export const FeatureCard = ({ icon, title, description, soon = false }: FeatureCardProps) => (
  <Card className="p-6 text-center hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm relative overflow-hidden animate-fade-in">
    {soon && (
      <div className="absolute top-2 right-2 flex items-center gap-1 text-xs font-medium text-primary">
        <Sparkles className="w-3 h-3" />
        Bientôt
      </div>
    )}
    <div className="mb-4 flex justify-center">{icon}</div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </Card>
);