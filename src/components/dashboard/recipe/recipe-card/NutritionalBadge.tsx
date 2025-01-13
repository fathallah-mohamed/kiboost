import { cn } from "@/lib/utils";

interface NutritionalBadgeProps {
  label: string;
  value: number;
  unit?: string;
  variant?: 'calories' | 'protein' | 'carbs' | 'fat';
}

const variantStyles = {
  calories: "bg-red-50 text-red-600",
  protein: "bg-blue-50 text-blue-600",
  carbs: "bg-yellow-50 text-yellow-600",
  fat: "bg-purple-50 text-purple-600",
};

export const NutritionalBadge = ({ label, value, unit = "g", variant = "calories" }: NutritionalBadgeProps) => (
  <div className={cn(
    "flex items-center gap-2 px-3 py-1.5 rounded-lg",
    variantStyles[variant]
  )}>
    <span className="text-sm font-medium">{label}</span>
    <span className="text-lg font-bold">
      {value}
      {unit !== "calories" && unit}
    </span>
  </div>
);