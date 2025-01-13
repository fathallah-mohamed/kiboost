import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Leftover {
  id: string;
  ingredient_name: string;
  quantity: number;
  unit: string;
  expiry_date: string;
  photos?: string[];
}

interface NewLeftover {
  ingredient_name: string;
  quantity: string;
  unit: string;
  expiry_date: string;
  photos: string[];
}

export const useLeftovers = (userId: string) => {
  const { toast } = useToast();
  const [newLeftover, setNewLeftover] = useState<NewLeftover>({
    ingredient_name: "",
    quantity: "",
    unit: "",
    expiry_date: "",
    photos: [],
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
        profile_id: userId,
        photos: newLeftover.photos,
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
        photos: [],
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

  return {
    leftovers,
    newLeftover,
    setNewLeftover,
    handleAddLeftover,
    handleDeleteLeftover,
  };
};