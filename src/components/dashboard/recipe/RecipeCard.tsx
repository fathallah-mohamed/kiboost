import { Card } from "@/components/ui/card";
import { Recipe } from "../types";

interface RecipeCardProps {
  recipe: Recipe;
}

export const RecipeCard = ({ recipe }: RecipeCardProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">{recipe.name}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold mb-2">Ingrédients</h4>
          <ul className="list-disc list-inside space-y-1">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index}>
                {ingredient.quantity} {ingredient.unit} {ingredient.item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Instructions</h4>
          <ol className="list-decimal list-inside space-y-1">
            {Array.isArray(recipe.instructions) ? (
              recipe.instructions.map((step, index) => (
                <li key={index}>{step}</li>
              ))
            ) : (
              <li>Instructions non disponibles</li>
            )}
          </ol>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="font-semibold mb-2">Informations nutritionnelles</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-2 bg-secondary/20 rounded">
            <div className="font-semibold">{recipe.nutritional_info.calories}</div>
            <div className="text-sm text-muted-foreground">Calories</div>
          </div>
          <div className="text-center p-2 bg-secondary/20 rounded">
            <div className="font-semibold">{recipe.nutritional_info.protein}g</div>
            <div className="text-sm text-muted-foreground">Protéines</div>
          </div>
          <div className="text-center p-2 bg-secondary/20 rounded">
            <div className="font-semibold">{recipe.nutritional_info.carbs}g</div>
            <div className="text-sm text-muted-foreground">Glucides</div>
          </div>
          <div className="text-center p-2 bg-secondary/20 rounded">
            <div className="font-semibold">{recipe.nutritional_info.fat}g</div>
            <div className="text-sm text-muted-foreground">Lipides</div>
          </div>
        </div>
      </div>
    </Card>
  );
};