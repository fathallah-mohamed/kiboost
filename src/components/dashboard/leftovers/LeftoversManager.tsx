import { Button } from "@/components/ui/button";
import { UtensilsCrossed } from "lucide-react";
import { useLeftovers } from "./hooks/useLeftovers";
import { useRecipeGeneration } from "./hooks/useRecipeGeneration";
import { AddLeftoverForm } from "./AddLeftoverForm";
import { LeftoversList } from "./LeftoversList";

interface LeftoversManagerProps {
  userId: string;
}

export const LeftoversManager = ({ userId }: LeftoversManagerProps) => {
  const {
    leftovers,
    newLeftover,
    setNewLeftover,
    handleAddLeftover,
    handleDeleteLeftover,
  } = useLeftovers(userId);

  const { analyzing, handleCreateRecipe } = useRecipeGeneration(userId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des restes</h2>
        <Button 
          onClick={() => handleCreateRecipe(leftovers)} 
          className="gap-2"
          disabled={analyzing}
        >
          <UtensilsCrossed className="w-4 h-4" />
          {analyzing ? "Analyse en cours..." : "Créer une recette avec les restes"}
        </Button>
      </div>

      <AddLeftoverForm
        newLeftover={newLeftover}
        onLeftoverChange={setNewLeftover}
        onSubmit={handleAddLeftover}
      />

      <LeftoversList
        leftovers={leftovers || []}
        onDelete={handleDeleteLeftover}
      />
    </div>
  );
};