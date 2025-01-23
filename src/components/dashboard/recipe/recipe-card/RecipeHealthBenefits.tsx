import { cn } from "@/lib/utils";
import { HealthBenefit } from "../../types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface RecipeHealthBenefitsProps {
  benefits: HealthBenefit[];
  compact?: boolean;
}

const categoryColors: { [key: string]: string } = {
  cognitive: "bg-[#FFE2E2] hover:bg-[#FFD1D1] text-[#FF9494] border-[#FF9494]",
  energy: "bg-[#FFF2CC] hover:bg-[#FFE5A3] text-[#FFB347] border-[#FFB347]",
  satiety: "bg-[#E2F0CB] hover:bg-[#D4E7B0] text-[#7FB069] border-[#7FB069]",
  digestive: "bg-[#D4F0F0] hover:bg-[#A8E6E6] text-[#30BFBF] border-[#30BFBF]",
  immunity: "bg-[#FFE5F1] hover:bg-[#FFD1E6] text-[#FF69B4] border-[#FF69B4]",
  growth: "bg-[#E0F4FF] hover:bg-[#B8E8FF] text-[#59B4D1] border-[#59B4D1]",
  mental: "bg-[#E2E0FF] hover:bg-[#CBC7FF] text-[#766CD1] border-[#766CD1]",
  organs: "bg-[#FFE8D6] hover:bg-[#FFD7B5] text-[#FF8B3D] border-[#FF8B3D]",
  beauty: "bg-[#FFE2FF] hover:bg-[#FFD1FF] text-[#FF69FF] border-[#FF69FF]",
  physical: "bg-[#D1F5D3] hover:bg-[#B5EDB8] text-[#4CAF50] border-[#4CAF50]",
  prevention: "bg-[#E6E6FA] hover:bg-[#D1D1FF] text-[#8080FF] border-[#8080FF]",
  global: "bg-[#FFE4E1] hover:bg-[#FFD1CC] text-[#FF6B6B] border-[#FF6B6B]"
};

export const RecipeHealthBenefits = ({ benefits, compact }: RecipeHealthBenefitsProps) => {
  if (!benefits || benefits.length === 0) {
    return null;
  }

  // Dédupliquer les bienfaits en se basant sur la catégorie et la description
  const uniqueBenefits = benefits.reduce((acc: HealthBenefit[], current) => {
    const exists = acc.some(benefit => 
      benefit.category === current.category && 
      benefit.description === current.description
    );
    if (!exists) {
      acc.push(current);
    }
    return acc;
  }, []);

  return (
    <TooltipProvider>
      <div className={cn(
        "flex flex-wrap gap-2",
        compact ? "justify-start" : "justify-center"
      )}>
        {uniqueBenefits.map((benefit, index) => (
          <Tooltip key={`${benefit.category}-${benefit.description}-${index}`}>
            <TooltipTrigger>
              <Badge 
                variant="secondary" 
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2.5 rounded-full transition-all duration-300",
                  "transform hover:scale-110 cursor-help",
                  "font-quicksand font-bold text-sm leading-relaxed",
                  "border-2 shadow-sm hover:shadow-md",
                  categoryColors[benefit.category],
                  "animate-[fadeIn_0.5s_ease-in-out]",
                  "animate-fade-in [animation-delay:var(--delay)]"
                )}
                style={{ 
                  "--delay": `${index * 100}ms`,
                  transform: `rotate(${Math.random() * 2 - 1}deg)`
                } as React.CSSProperties}
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
            <TooltipContent 
              className="bg-white/95 backdrop-blur-sm border-2 p-3 rounded-xl shadow-xl"
              side="top"
            >
              <p className="text-sm font-medium">{benefit.description}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};