import { cn } from "@/lib/utils";
import { HealthBenefit } from "../../types";
import { 
  Brain, 
  Heart, 
  Sun, 
  Shield, 
  Leaf, 
  Lightbulb, 
  Battery, 
  Apple, 
  Dumbbell, 
  Sparkles,
  Cookie,
  Zap
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const iconMap: { [key: string]: React.ComponentType<any> } = {
  brain: Brain,
  heart: Heart,
  sun: Sun,
  shield: Shield,
  leaf: Leaf,
  lightbulb: Lightbulb,
  battery: Battery,
  apple: Apple,
  dumbbell: Dumbbell,
  sparkles: Sparkles,
  cookie: Cookie,
  zap: Zap
};

const categoryColors: { [key: string]: string } = {
  cognitive: "bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200",
  energy: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200",
  satiety: "bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200",
  digestive: "bg-green-100 text-green-700 hover:bg-green-200 border-green-200",
  immunity: "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200",
  growth: "bg-pink-100 text-pink-700 hover:bg-pink-200 border-pink-200",
  mental: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-indigo-200",
  organs: "bg-red-100 text-red-700 hover:bg-red-200 border-red-200",
  beauty: "bg-rose-100 text-rose-700 hover:bg-rose-200 border-rose-200",
  physical: "bg-cyan-100 text-cyan-700 hover:bg-cyan-200 border-cyan-200",
  prevention: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200",
  global: "bg-violet-100 text-violet-700 hover:bg-violet-200 border-violet-200"
};

interface RecipeHealthBenefitsProps {
  benefits: HealthBenefit[];
  compact?: boolean;
}

export const RecipeHealthBenefits = ({ benefits, compact }: RecipeHealthBenefitsProps) => {
  if (!benefits || benefits.length === 0) {
    console.log("No benefits to display");
    return null;
  }

  return (
    <TooltipProvider>
      <div className={cn(
        "flex flex-wrap gap-2",
        compact ? "justify-start" : "justify-center"
      )}>
        {benefits.map((benefit, index) => {
          const Icon = iconMap[benefit.icon] || Sparkles;
          return (
            <Tooltip key={index}>
              <TooltipTrigger>
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "flex items-center gap-1 px-3 py-1.5 transition-all duration-200 transform hover:scale-105 animate-fade-in",
                    categoryColors[benefit.category],
                    "cursor-help shadow-sm hover:shadow-md"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className={cn(
                    "text-sm font-medium",
                    compact ? "hidden sm:inline" : "inline"
                  )}>
                    {benefit.description}
                  </span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">{benefit.description}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
};