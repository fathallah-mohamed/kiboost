import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";

interface Leftover {
  id: string;
  ingredient_name: string;
  quantity: number;
  unit: string;
  expiry_date: string;
  photos?: string[];
}

interface LeftoversListProps {
  leftovers: Leftover[];
  onDelete: (id: string) => void;
}

export const LeftoversList = ({ leftovers, onDelete }: LeftoversListProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Liste des restes</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Photos</TableHead>
            <TableHead>Ingrédient</TableHead>
            <TableHead>Quantité</TableHead>
            <TableHead>Unité</TableHead>
            <TableHead>Date de péremption</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leftovers?.map((leftover) => (
            <TableRow key={leftover.id}>
              <TableCell>
                <div className="flex gap-2">
                  {leftover.photos?.map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ))}
                </div>
              </TableCell>
              <TableCell>{leftover.ingredient_name}</TableCell>
              <TableCell>{leftover.quantity}</TableCell>
              <TableCell>{leftover.unit}</TableCell>
              <TableCell>
                {format(parseISO(leftover.expiry_date), "d MMMM yyyy", {
                  locale: fr,
                })}
              </TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(leftover.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};