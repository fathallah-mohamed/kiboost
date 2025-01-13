import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { RecipeCard } from "./RecipeCard";
import { Recipe } from "../types";

interface RecipeListProps {
  recipes: Recipe[];
  error: string | null;
  plannedRecipes: string[];
  onSaveRecipe: (recipe: Recipe) => void;
}

export const RecipeList = ({
  recipes,
  error,
  plannedRecipes,
  onSaveRecipe
}: RecipeListProps) => {
  return (
    <>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recipes.map((recipe, index) => (
          <div key={index} className="relative">
            <RecipeCard recipe={recipe} />
            <Button
              className="absolute top-4 right-4"
              onClick={() => onSaveRecipe(recipe)}
              disabled={plannedRecipes.includes(recipe.id)}
            >
              <Plus className="w-4 h-4 mr-2" />
              {plannedRecipes.includes(recipe.id) ? 'Déjà planifiée' : 'Planifier'}
            </Button>
          </div>
        ))}
      </div>
    </>
  );
};