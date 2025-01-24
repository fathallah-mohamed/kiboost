import { Alert, AlertDescription } from "@/components/ui/alert";
import { Recipe } from "../types";
import { RecipeCard } from "./recipe-card/RecipeCard";
import { useEffect, useState } from "react";

interface RecipeListProps {
  recipes: Recipe[];
  error: string | null;
  plannedRecipes: { [key: string]: Recipe | null };
  onSaveRecipe: (recipe: Recipe) => void;
}

export const RecipeList = ({
  recipes,
  error,
  plannedRecipes,
  onSaveRecipe
}: RecipeListProps) => {
  const [newRecipeIds, setNewRecipeIds] = useState<string[]>([]);

  useEffect(() => {
    // Identifier les nouvelles recettes
    const currentIds = recipes.map(r => r.id);
    setNewRecipeIds(currentIds);

    // Réinitialiser après 5 secondes
    const timer = setTimeout(() => {
      setNewRecipeIds([]);
    }, 5000);

    return () => clearTimeout(timer);
  }, [recipes]);

  // Trier les recettes pour mettre les nouvelles en haut
  const sortedRecipes = [...recipes].sort((a, b) => {
    const aIsNew = newRecipeIds.includes(a.id);
    const bIsNew = newRecipeIds.includes(b.id);
    if (aIsNew && !bIsNew) return -1;
    if (!aIsNew && bIsNew) return 1;
    return 0;
  });

  return (
    <>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {sortedRecipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            isNew={newRecipeIds.includes(recipe.id)}
            isPlanned={Object.values(plannedRecipes).some(
              (plannedRecipe) => plannedRecipe?.id === recipe.id
            )}
            onAdd={onSaveRecipe}
          />
        ))}
      </div>
    </>
  );
};