import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { 
  Leaf, Apple, Wheat, Flame, Droplet, CircleDot, Cookie, Boxes,
  Waves // Remplacé Salt par Waves qui est plus approprié pour représenter le sel
} from "lucide-react";

type ScoreLevel = 'excellent' | 'good' | 'moderate' | 'poor';

interface NutritionalScoreProps {
  type: 'bio' | 'fruits' | 'fibres' | 'calories' | 'graisses' | 'sel' | 'sucre' | 'additifs';
  value: number;
  maxValue?: number;
  className?: string;
}

const getLevel = (type: string, value: number, maxValue: number): ScoreLevel => {
  const percentage = (value / maxValue) * 100;
  
  if (percentage <= 25) return 'excellent';
  if (percentage <= 50) return 'good';
  if (percentage <= 75) return 'moderate';
  return 'poor';
};

const getLevelDescription = (type: string, level: ScoreLevel): string => {
  const descriptions = {
    bio: {
      excellent: 'Bio certifié',
      good: 'Partiellement bio',
      moderate: 'Culture raisonnée',
      poor: 'Conventionnel'
    },
    fruits: {
      excellent: 'Excellente quantité',
      good: 'Bonne quantité',
      moderate: 'Quantité moyenne',
      poor: 'Faible quantité'
    },
    fibres: {
      excellent: 'Riche en fibres',
      good: 'Source de fibres',
      moderate: 'Quelques fibres',
      poor: 'Pauvre en fibres'
    },
    calories: {
      excellent: 'Très peu calorique',
      good: 'Peu calorique',
      moderate: 'Modérément calorique',
      poor: 'Très calorique'
    },
    graisses: {
      excellent: 'Très peu de graisses',
      good: 'Peu de graisses',
      moderate: 'Modérément gras',
      poor: 'Très gras'
    },
    sel: {
      excellent: 'Sans sel',
      good: 'Peu salé',
      moderate: 'Salé',
      poor: 'Très salé'
    },
    sucre: {
      excellent: 'Sans sucre',
      good: 'Peu sucré',
      moderate: 'Sucré',
      poor: 'Très sucré'
    },
    additifs: {
      excellent: 'Sans additifs',
      good: '1-2 additifs',
      moderate: '3-4 additifs',
      poor: '5+ additifs'
    }
  };

  return descriptions[type as keyof typeof descriptions][level];
};

const typeConfig = {
  bio: {
    icon: Leaf,
    label: "Bio",
    defaultMax: 1,
    unit: ""
  },
  fruits: {
    icon: Apple,
    label: "Fruits",
    defaultMax: 100,
    unit: "%"
  },
  fibres: {
    icon: Wheat,
    label: "Fibres",
    defaultMax: 10,
    unit: "g"
  },
  calories: {
    icon: Flame,
    label: "Calories",
    defaultMax: 800,
    unit: "kcal"
  },
  graisses: {
    icon: Droplet,
    label: "Graisses saturées",
    defaultMax: 20,
    unit: "g"
  },
  sel: {
    icon: Waves,
    label: "Sel",
    defaultMax: 5,
    unit: "g"
  },
  sucre: {
    icon: Cookie,
    label: "Sucre",
    defaultMax: 30,
    unit: "g"
  },
  additifs: {
    icon: Boxes,
    label: "Additifs",
    defaultMax: 10,
    unit: ""
  }
};

const levelStyles: Record<ScoreLevel, string> = {
  excellent: "text-green-700",
  good: "text-green-600",
  moderate: "text-yellow-600",
  poor: "text-red-600"
};

const levelColors: Record<ScoreLevel, string> = {
  excellent: "bg-green-500",
  good: "bg-green-400",
  moderate: "bg-yellow-400",
  poor: "bg-red-400"
};

export const NutritionalScore = ({ 
  type, 
  value, 
  maxValue, 
  className 
}: NutritionalScoreProps) => {
  const config = typeConfig[type];
  const max = maxValue || config.defaultMax;
  const level = getLevel(type, value, max);
  const description = getLevelDescription(type, level);
  const Icon = config.icon;
  const progressValue = (value / max) * 100;

  return (
    <div className={cn(
      "flex items-center gap-4 p-4 rounded-lg border bg-white/50 hover:bg-white/80 transition-colors",
      className
    )}>
      <Icon className={cn("w-6 h-6", levelStyles[level])} />
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <span className="font-medium">{config.label}</span>
          <span className="text-sm font-medium">
            {value}{config.unit}
          </span>
        </div>
        
        <div className="text-sm text-muted-foreground mb-2">
          {description}
        </div>

        <Progress 
          value={progressValue} 
          className="h-2"
          indicatorClassName={levelColors[level]}
        />
      </div>

      <CircleDot className={cn(
        "w-4 h-4",
        levelStyles[level]
      )} />
    </div>
  );
};