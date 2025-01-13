import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { PhotoUploader } from "./PhotoUploader";

interface AddLeftoverFormProps {
  newLeftover: {
    ingredient_name: string;
    quantity: string;
    unit: string;
    expiry_date: string;
    photos: string[];
  };
  onLeftoverChange: (leftover: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const AddLeftoverForm = ({
  newLeftover,
  onLeftoverChange,
  onSubmit,
}: AddLeftoverFormProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Ajouter un reste</h3>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="ingredient">Ingrédient</Label>
            <Input
              id="ingredient"
              value={newLeftover.ingredient_name}
              onChange={(e) =>
                onLeftoverChange({ ...newLeftover, ingredient_name: e.target.value })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="quantity">Quantité</Label>
            <Input
              id="quantity"
              type="number"
              step="0.1"
              value={newLeftover.quantity}
              onChange={(e) =>
                onLeftoverChange({ ...newLeftover, quantity: e.target.value })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="unit">Unité</Label>
            <Input
              id="unit"
              value={newLeftover.unit}
              onChange={(e) =>
                onLeftoverChange({ ...newLeftover, unit: e.target.value })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="expiry">Date de péremption</Label>
            <Input
              id="expiry"
              type="date"
              value={newLeftover.expiry_date}
              onChange={(e) =>
                onLeftoverChange({ ...newLeftover, expiry_date: e.target.value })
              }
              required
            />
          </div>
        </div>

        <div>
          <Label>Photos</Label>
          <PhotoUploader
            onPhotosUploaded={(urls) => onLeftoverChange({ ...newLeftover, photos: urls })}
            existingPhotos={newLeftover.photos}
          />
        </div>

        <Button type="submit">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter
        </Button>
      </form>
    </Card>
  );
};