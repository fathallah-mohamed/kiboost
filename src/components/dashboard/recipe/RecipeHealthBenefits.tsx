import { cn } from "@/lib/utils";
import { HealthBenefit } from "../types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface RecipeHealthBenefitsProps {
  benefits: HealthBenefit[];
  compact?: boolean;
}

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
          <Tooltip key={`${benefit.category}-${index}`}>
            <TooltipTrigger>
              <Badge 
                variant="secondary"
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded-full",
                  "transform hover:scale-105 cursor-help transition-all",
                  "text-sm"
                )}
              >
                <span>{benefit.icon}</span>
                <span className={cn(
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