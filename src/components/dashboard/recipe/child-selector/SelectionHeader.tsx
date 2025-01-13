import { Button } from '@/components/ui/button';

interface SelectionHeaderProps {
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export const SelectionHeader = ({ onSelectAll, onDeselectAll }: SelectionHeaderProps) => (
  <div className="flex justify-between items-center">
    <h3 className="text-xl font-semibold">Sélection des enfants</h3>
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        size="sm"
        className="rounded-full"
        onClick={onSelectAll}
      >
        Tout sélectionner
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        className="rounded-full"
        onClick={onDeselectAll}
      >
        Tout désélectionner
      </Button>
    </div>
  </div>
);