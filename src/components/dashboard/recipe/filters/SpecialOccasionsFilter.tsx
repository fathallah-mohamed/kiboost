import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PartyPopper, School, Clock, Cake, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { SpecialOccasion } from "../../types";

interface SpecialOccasionsFilterProps {
  selectedOccasion: SpecialOccasion | undefined;
  onOccasionChange: (occasion: SpecialOccasion | undefined) => void;
}

const occasions: Array<{
  value: SpecialOccasion;
  label: string;
  icon: React.ReactNode;
}> = [
  { value: 'birthday', label: 'Anniversaire', icon: <Cake className="w-4 h-4" /> },
  { value: 'school', label: 'École', icon: <School className="w-4 h-4" /> },
  { value: 'quick', label: 'Rapide', icon: <Clock className="w-4 h-4" /> },
  { value: 'party', label: 'Fête', icon: <PartyPopper className="w-4 h-4" /> },
  { value: 'holiday', label: 'Vacances', icon: <CalendarDays className="w-4 h-4" /> },
];

export const SpecialOccasionsFilter = ({
  selectedOccasion,
  onOccasionChange,
}: SpecialOccasionsFilterProps) => {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <PartyPopper className="w-4 h-4 text-primary" />
        Occasions spéciales
      </Label>
      <div className="flex flex-wrap gap-2">
        {occasions.map(({ value, label, icon }) => (
          <Badge
            key={value}
            variant={selectedOccasion === value ? "default" : "outline"}
            className={cn(
              "cursor-pointer flex items-center gap-1 transition-all",
              selectedOccasion === value 
                ? "bg-primary hover:bg-primary/90" 
                : "hover:bg-secondary/50"
            )}
            onClick={() => onOccasionChange(selectedOccasion === value ? undefined : value)}
          >
            {icon}
            {label}
          </Badge>
        ))}
      </div>
    </div>
  );
};