import { cn } from "@/lib/utils";

interface HealthScoreProps {
  label: string;
  score: 'low' | 'medium' | 'high';
  icon: React.ReactNode;
}

const scoreStyles = {
  low: "bg-green-50 text-green-600",
  medium: "bg-yellow-50 text-yellow-600",
  high: "bg-red-50 text-red-600",
};

const scoreEmoji = {
  low: "🟢",
  medium: "🟡",
  high: "🔴",
};

export const HealthScore = ({ label, score, icon }: HealthScoreProps) => (
  <div className={cn(
    "flex items-center gap-2 px-3 py-1.5 rounded-lg",
    scoreStyles[score]
  )}>
    <span className="flex items-center gap-1">
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </span>
    <span>{scoreEmoji[score]}</span>
  </div>
);