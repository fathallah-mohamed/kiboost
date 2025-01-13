import { cn } from "@/lib/utils";

interface NutritionalGaugeProps {
  value: number;
  maxValue: number;
  label: string;
  icon: React.ReactNode;
}

export const NutritionalGauge = ({ value, maxValue, label, icon }: NutritionalGaugeProps) => {
  const percentage = (value / maxValue) * 100;
  
  const getColor = (percentage: number) => {
    if (percentage <= 33) return "bg-green-500";
    if (percentage <= 66) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium">{label}</span>
          <span className="text-sm text-gray-600">{value}g</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={cn("h-full transition-all", getColor(percentage))}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};