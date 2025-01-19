import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface SeasonalityFilterProps {
  selectedMonth: number | undefined;
  onMonthChange: (month: number) => void;
}

export const SeasonalityFilter = ({
  selectedMonth,
  onMonthChange,
}: SeasonalityFilterProps) => {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-primary" />
        Saisonnalité
      </Label>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
          <Badge
            key={month}
            variant={selectedMonth === month ? "default" : "outline"}
            className={cn(
              "cursor-pointer transition-all",
              selectedMonth === month 
                ? "bg-primary hover:bg-primary/90" 
                : "hover:bg-secondary/50"
            )}
            onClick={() => onMonthChange(month)}
          >
            {new Date(2024, month - 1).toLocaleString('fr-FR', { month: 'long' })}
          </Badge>
        ))}
      </div>
    </div>
  );
};