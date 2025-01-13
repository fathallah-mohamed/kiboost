import { cn } from "@/lib/utils";
import { Beef, Flame, Cookie, Wheat } from "lucide-react";

type NutritionalLevel = 'low' | 'medium' | 'high';

interface NutritionalIndicatorProps {
  type: 'calories' | 'protein' | 'carbs' | 'fat';
  value: number;
  className?: string;
}

const getLevel = (type: string, value: number): NutritionalLevel => {
  const thresholds = {
    calories: { low: 300, high: 600 },
    protein: { low: 10, high: 20 },
    carbs: { low: 30, high: 60 },
    fat: { low: 10, high: 20 },
  };

  const threshold = thresholds[type as keyof typeof thresholds];
  if (value <= threshold.low) return 'low';
  if (value >= threshold.high) return 'high';
  return 'medium';
};

const levelStyles: Record<NutritionalLevel, string> = {
  low: "bg-green-100 text-green-700 border-green-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  high: "bg-red-100 text-red-700 border-red-200",
};

const typeConfig = {
  calories: {
    icon: Flame,
    label: "Calories",
    unit: "kcal"
  },
  protein: {
    icon: Beef,
    label: "Protéines",
    unit: "g"
  },
  carbs: {
    icon: Wheat,
    label: "Glucides",
    unit: "g"
  },
  fat: {
    icon: Cookie,
    label: "Lipides",
    unit: "g"
  }
};

export const NutritionalIndicator = ({ type, value, className }: NutritionalIndicatorProps) => {
  const level = getLevel(type, value);
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-2 rounded-lg border",
      levelStyles[level],
      className
    )}>
      <Icon className="w-5 h-5" />
      <div className="flex flex-col">
        <span className="text-sm font-medium">{config.label}</span>
        <span className="text-lg font-bold">
          {value}{config.unit}
        </span>
      </div>
    </div>
  );
};