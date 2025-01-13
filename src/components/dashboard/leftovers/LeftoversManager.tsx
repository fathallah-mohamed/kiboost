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
import { Plus, Trash2, UtensilsCrossed } from "lucide-react";
import { Recipe } from "../types";

interface Leftover {
  id: string;
  ingredient_name: string;
  quantity: number;
  unit: string;
  expiry_date: string;
}

interface LeftoversManagerProps {
  userId: string;
}

export const LeftoversManager = ({ userId }: LeftoversManagerProps) => {
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
        .eq('profile_id', userId)
        .order("expiry_date", { ascending: true });

      if (error) throw error;
      return data as Leftover[];
    },
  });

  const handleAddLeftover = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("leftovers").insert({
        ingredient_name: newLeftover.ingredient_name,
        quantity: parseFloat(newLeftover.quantity),
        unit: newLeftover.unit,
        expiry_date: newLeftover.expiry_date,
        profile_id: userId
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

  const handleCreateRecipe = async () => {
    if (!leftovers?.length) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Aucun reste disponible pour créer une recette.",
      });
      return;
    }

    try {
      const ingredients = leftovers.map(leftover => ({
        item: leftover.ingredient_name,
        quantity: leftover.quantity.toString(),
        unit: leftover.unit
      }));

      const recipe: Partial<Recipe> = {
        name: "Recette avec restes du " + format(new Date(), 'dd/MM/yyyy'),
        ingredients,
        instructions: ["Utilisez les restes disponibles pour créer votre recette"],
        nutritional_info: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0
        },
        meal_type: "dinner",
        preparation_time: 30,
        difficulty: "medium",
        servings: 4
      };

      const { data: savedRecipe, error } = await supabase
        .from("recipes")
        .insert({
          ...recipe,
          profile_id: userId
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Recette créée",
        description: "Une nouvelle recette a été créée à partir des restes.",
      });

      // Optionally, clear used leftovers
      // await Promise.all(leftovers.map(leftover => handleDeleteLeftover(leftover.id)));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de la recette.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des restes</h2>
        <Button onClick={handleCreateRecipe} className="gap-2">
          <UtensilsCrossed className="w-4 h-4" />
          Créer une recette avec les restes
        </Button>
      </div>

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