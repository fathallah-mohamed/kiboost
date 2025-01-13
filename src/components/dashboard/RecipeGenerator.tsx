import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2, ChefHat } from 'lucide-react';
import { RecipeCard } from "./recipe/RecipeCard";
import { useRecipeGeneration } from "./recipe/useRecipeGeneration";
import { ChildProfile } from "./types";

interface RecipeGeneratorProps {
  selectedChild: ChildProfile | null;
}

export const RecipeGenerator = ({ selectedChild }: RecipeGeneratorProps) => {
  const { loading, recipe, error, generateRecipe } = useRecipeGeneration();

  const handleGenerateRecipe = async () => {
    if (!selectedChild) {
      return;
    }
    await generateRecipe(selectedChild);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Générateur de recettes</h2>
        <Button 
          onClick={handleGenerateRecipe} 
          disabled={loading || !selectedChild}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <ChefHat className="w-4 h-4 mr-2" />
          )}
          Générer une recette
        </Button>
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