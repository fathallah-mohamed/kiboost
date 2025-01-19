import { Label } from "@/components/ui/label";
import { DollarSign } from "lucide-react";

interface BudgetFilterProps {
  maxCost: number;
  onMaxCostChange: (cost: number) => void;
}

export const BudgetFilter = ({ maxCost, onMaxCostChange }: BudgetFilterProps) => {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <DollarSign className="w-4 h-4 text-primary" />
        Budget maximum par portion: {maxCost}€
      </Label>
      <input
        type="range"
        min={5}
        max={30}
        step={1}
        value={maxCost}
        onChange={(e) => onMaxCostChange(Number(e.target.value))}
        className="w-full accent-primary"
      />
    </div>
  );
};