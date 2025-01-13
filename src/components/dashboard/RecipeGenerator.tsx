import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2, ChefHat } from 'lucide-react';
import { RecipeCard } from "./recipe/RecipeCard";
import { useRecipeGeneration } from "./recipe/useRecipeGeneration";
import { ChildProfile } from "./types";
import { ChildSelector } from "./recipe/ChildSelector";
import { useState } from "react";

export const RecipeGenerator = () => {
  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(null);
  const { loading, recipe, error, generateRecipe } = useRecipeGeneration();

  const handleGenerateRecipe = async () => {
    if (!selectedChild) return;
    await generateRecipe(selectedChild);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold">Générateur de recettes</h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
          <div className="w-full sm:w-64">
            <ChildSelector onSelectChild={setSelectedChild} />
          </div>
          <Button 
            onClick={handleGenerateRecipe} 
            disabled={loading || !selectedChild}
            className="whitespace-nowrap"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <ChefHat className="w-4 h-4 mr-2" />
            )}
            Générer une recette
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {recipe && <RecipeCard recipe={recipe} />}
    </div>
  );
};