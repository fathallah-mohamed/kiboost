import { Badge } from "@/components/ui/badge";
import { HealthBenefit } from "../../types";
import { Brain, Leaf, Shield, Zap } from "lucide-react";

const iconMap: { [key: string]: React.ComponentType } = {
  brain: Brain,
  zap: Zap,
  shield: Shield,
  leaf: Leaf,
};

interface RecipeHealthBenefitsProps {
  benefits: HealthBenefit[];
}

export const RecipeHealthBenefits = ({ benefits }: RecipeHealthBenefitsProps) => {
  if (!benefits || benefits.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {benefits.map((benefit, index) => {
        const Icon = iconMap[benefit.icon] || Leaf;
        return (
          <Badge 
            key={index}
            variant="secondary" 
            className="flex items-center gap-1 px-2 py-1"
          >
            <Icon className="w-4 h-4" />
            <span>{benefit.description}</span>
          </Badge>
        );
      })}
    </div>
  );
};