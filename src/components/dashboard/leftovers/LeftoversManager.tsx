import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";

interface Leftover {
  id: string;
  ingredient_name: string;
  quantity: number;
  unit: string;
  expiry_date: string;
}

export const LeftoversManager = () => {
  const { toast } = useToast();
  const [newLeftover, setNewLeftover] = useState({
    ingredient_name: "",
    quantity: "",
    unit: "",
    expiry_date: "",
  });

  const { data: leftovers, refetch } = useQuery({
    queryKey: ["leftovers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leftovers")
        .select("*")
        .order("expiry_date", { ascending: true });

      if (error) throw error;
      return data as Leftover[];
    },
  });

  const handleAddLeftover = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase.from("leftovers").insert({
        ingredient_name: newLeftover.ingredient_name,
        quantity: parseFloat(newLeftover.quantity),
        unit: newLeftover.unit,
        expiry_date: newLeftover.expiry_date,
        profile_id: user.id
      });

      if (error) throw error;

      toast({
        title: "Reste ajouté",
        description: "Le reste a été ajouté avec succès.",
      });

      setNewLeftover({
        ingredient_name: "",
        quantity: "",
        unit: "",
        expiry_date: "",
      });

      refetch();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout du reste.",
      });
    }
  };

  const handleDeleteLeftover = async (id: string) => {
    try {
      const { error } = await supabase.from("leftovers").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Reste supprimé",
        description: "Le reste a été supprimé avec succès.",
      });

      refetch();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression du reste.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Ajouter un reste</h3>
        <form onSubmit={handleAddLeftover} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="ingredient">Ingrédient</Label>
              <Input
                id="ingredient"
                value={newLeftover.ingredient_name}
                onChange={(e) =>
                  setNewLeftover({ ...newLeftover, ingredient_name: e.target.value })
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
                  setNewLeftover({ ...newLeftover, quantity: e.target.value })
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
                  setNewLeftover({ ...newLeftover, unit: e.target.value })
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
                  setNewLeftover({ ...newLeftover, expiry_date: e.target.value })
                }
                required
              />
            </div>
          </div>
          <Button type="submit">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Liste des restes</h3>
        <Table>
          <TableHeader>
            <TableRow>
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
                    onClick={() => handleDeleteLeftover(leftover.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};