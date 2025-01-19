import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Brain, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

const healthBenefits = [
  { category: 'cognitive', icon: <Brain className="w-4 h-4" />, label: 'Développement cognitif' },
  { category: 'energy', icon: <Brain className="w-4 h-4" />, label: 'Énergie' },
  { category: 'immunity', icon: <Brain className="w-4 h-4" />, label: 'Immunité' },
  { category: 'growth', icon: <Brain className="w-4 h-4" />, label: 'Croissance' },
  { category: 'physical', icon: <Brain className="w-4 h-4" />, label: 'Développement physique' },
];

interface HealthBenefitsFilterProps {
  selectedBenefits: string[];
  onBenefitsChange: (benefits: string[]) => void;
}

export const HealthBenefitsFilter = ({
  selectedBenefits,
  onBenefitsChange,
}: HealthBenefitsFilterProps) => {
  const toggleBenefit = (category: string) => {
    const updated = selectedBenefits.includes(category)
      ? selectedBenefits.filter(b => b !== category)
      : [...selectedBenefits, category];
    onBenefitsChange(updated);
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Heart className="w-4 h-4 text-primary" />
        Bienfaits santé recherchés
      </Label>
      <div className="flex flex-wrap gap-2">
        {healthBenefits.map((benefit) => (
          <Badge
            key={benefit.category}
            variant={selectedBenefits.includes(benefit.category) ? "default" : "outline"}
            className={cn(
              "cursor-pointer flex items-center gap-1 transition-all",
              selectedBenefits.includes(benefit.category) 
                ? "bg-primary hover:bg-primary/90" 
                : "hover:bg-secondary/50"
            )}
            onClick={() => toggleBenefit(benefit.category)}
          >
            {benefit.icon}
            {benefit.label}
          </Badge>
        ))}
      </div>
    </div>
  );
};