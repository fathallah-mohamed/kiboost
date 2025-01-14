import { Badge } from "@/components/ui/badge";
import { HealthBenefit } from "../../types";
import { 
  Brain, Zap, Cookie, Shield, Leaf, 
  Lightbulb, Battery, Apple, Heart, 
  Sun, Dumbbell, Sparkles 
} from 'lucide-react';
import { cn } from "@/lib/utils";

const iconMap: { [key: string]: React.ComponentType<any> } = {
  brain: Brain,      // cognitive
  zap: Zap,         // energy
  cookie: Cookie,    // satiety
  shield: Shield,    // immunity
  leaf: Leaf,       // digestive
  lightbulb: Lightbulb, // creativity
  battery: Battery,  // fatigue
  apple: Apple,     // nutrition
  heart: Heart,     // cardiovascular
  sun: Sun,         // vitality
  dumbbell: Dumbbell, // physical
  sparkles: Sparkles  // beauty
};

const categoryColors: { [key: string]: string } = {
  cognitive: "bg-purple-50 text-purple-600",
  energy: "bg-yellow-50 text-yellow-600",
  satiety: "bg-orange-50 text-orange-600",
  digestive: "bg-green-50 text-green-600",
  immunity: "bg-blue-50 text-blue-600",
  growth: "bg-pink-50 text-pink-600",
  mental: "bg-indigo-50 text-indigo-600",
  organs: "bg-red-50 text-red-600",
  beauty: "bg-rose-50 text-rose-600",
  physical: "bg-cyan-50 text-cyan-600",
  prevention: "bg-emerald-50 text-emerald-600",
  global: "bg-violet-50 text-violet-600"
};

interface RecipeHealthBenefitsProps {
  benefits: HealthBenefit[];
  compact?: boolean;
}

export const RecipeHealthBenefits = ({ benefits, compact }: RecipeHealthBenefitsProps) => {
  if (!benefits || benefits.length === 0) return null;

  return (
    <div className={cn(
      "flex flex-wrap gap-2",
      compact ? "justify-start" : "justify-center"
    )}>
      {benefits.map((benefit, index) => {
        const Icon = iconMap[benefit.icon] || Leaf;
        return (
          <Badge 
            key={index}
            variant="secondary" 
            className={cn(
              "flex items-center gap-1 px-2 py-1",
              categoryColors[benefit.category]
            )}
          >
            <Icon className="w-4 h-4" />
            <span className={cn(
              "text-sm",
              compact ? "hidden sm:inline" : "inline"
            )}>
              {benefit.description}
            </span>
          </Badge>
        );
      })}
    </div>
  );
};