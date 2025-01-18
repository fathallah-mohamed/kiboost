import { cn } from "@/lib/utils";
import { HealthBenefit } from "../../types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface RecipeHealthBenefitsProps {
  benefits: HealthBenefit[];
  compact?: boolean;
}

const categoryColors: { [key: string]: string } = {
  cognitive: "bg-purple-100 hover:bg-purple-200 text-purple-700 border-purple-300",
  energy: "bg-yellow-100 hover:bg-yellow-200 text-yellow-700 border-yellow-300",
  satiety: "bg-orange-100 hover:bg-orange-200 text-orange-700 border-orange-300",
  digestive: "bg-green-100 hover:bg-green-200 text-green-700 border-green-300",
  immunity: "bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-300",
  growth: "bg-pink-100 hover:bg-pink-200 text-pink-700 border-pink-300",
  mental: "bg-indigo-100 hover:bg-indigo-200 text-indigo-700 border-indigo-300",
  organs: "bg-red-100 hover:bg-red-200 text-red-700 border-red-300",
  beauty: "bg-rose-100 hover:bg-rose-200 text-rose-700 border-rose-300",
  physical: "bg-cyan-100 hover:bg-cyan-200 text-cyan-700 border-cyan-300",
  prevention: "bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border-emerald-300",
  global: "bg-violet-100 hover:bg-violet-200 text-violet-700 border-violet-300"
};

export const RecipeHealthBenefits = ({ benefits, compact }: RecipeHealthBenefitsProps) => {
  if (!benefits || benefits.length === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className={cn(
        "flex flex-wrap gap-2",
        compact ? "justify-start" : "justify-center"
      )}>
        {benefits.map((benefit, index) => (
          <Tooltip key={index}>
            <TooltipTrigger>
              <Badge 
                variant="secondary" 
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-full transition-all duration-300",
                  "transform hover:scale-105 cursor-help shadow-sm hover:shadow-md",
                  "font-medium text-sm leading-relaxed",
                  "border-2",
                  categoryColors[benefit.category],
                  "animate-fade-in [animation-delay:var(--delay)]"
                )}
                style={{ "--delay": `${index * 100}ms` } as React.CSSProperties}
              >
                <span className="text-lg">{
                  benefit.icon === "brain" ? "🧠" :
                  benefit.icon === "zap" ? "⚡" :
                  benefit.icon === "cookie" ? "🍪" :
                  benefit.icon === "shield" ? "🛡️" :
                  benefit.icon === "leaf" ? "🌿" :
                  benefit.icon === "lightbulb" ? "💡" :
                  benefit.icon === "battery" ? "🔋" :
                  benefit.icon === "apple" ? "🍎" :
                  benefit.icon === "heart" ? "❤️" :
                  benefit.icon === "sun" ? "☀️" :
                  benefit.icon === "dumbbell" ? "💪" :
                  benefit.icon === "sparkles" ? "✨" : "🌟"
                }</span>
                <span className={cn(
                  "font-quicksand",
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
        ))}
      </div>
    </TooltipProvider>
  );
};