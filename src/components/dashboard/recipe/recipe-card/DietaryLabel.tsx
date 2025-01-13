import { cn } from "@/lib/utils";
import { Leaf, Ban, Cookie } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type DietaryType = 'bio' | 'gluten-free' | 'low-sugar' | 'vegan';

interface DietaryLabelProps {
  type: DietaryType;
}

const dietaryConfig = {
  'bio': {
    icon: Leaf,
    label: 'Bio',
    className: 'bg-green-100 text-green-700 hover:bg-green-200',
  },
  'gluten-free': {
    icon: Ban,
    label: 'Sans gluten',
    className: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
  },
  'low-sugar': {
    icon: Cookie,
    label: 'Moins sucré',
    className: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  },
  'vegan': {
    icon: Leaf,
    label: 'Vegan',
    className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
  },
};

export const DietaryLabel = ({ type }: DietaryLabelProps) => {
  const config = dietaryConfig[type];
  const Icon = config.icon;

  return (
    <Badge 
      variant="secondary"
      className={cn(
        "transition-colors duration-200 cursor-help",
        config.className
      )}
    >
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
};