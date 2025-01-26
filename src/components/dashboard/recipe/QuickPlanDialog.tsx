import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { MultiChildSelector } from "./MultiChildSelector";
import { ChildProfile } from "../types";

interface QuickPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (selectedChildren: ChildProfile[]) => void;
}

export const QuickPlanDialog = ({
  open,
  onOpenChange,
  onConfirm,
}: QuickPlanDialogProps) => {
  const [selectedChildren, setSelectedChildren] = useState<ChildProfile[]>([]);

  const handleConfirm = () => {
    onConfirm(selectedChildren);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Sélectionnez les enfants</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <MultiChildSelector
            onSelectChildren={setSelectedChildren}
            selectedChildren={selectedChildren}
            mode="compact"
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Annuler
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedChildren.length === 0}
          >
            Générer le planning
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};