import { Utensils } from "lucide-react";

interface RecipeIngredientsProps {
  ingredients: Array<{
    item: string;
    quantity: string;
    unit: string;
  }>;
}

export const RecipeIngredients = ({ ingredients }: RecipeIngredientsProps) => {
  return (
    <div className="space-y-4">
      <h4 className="font-semibold flex items-center gap-2">
        <Utensils className="w-4 h-4 text-primary" />
        Ingrédients magiques
      </h4>
      <ul className="space-y-2">
        {ingredients.map((ingredient, index) => (
          <li key={index} className="flex items-center gap-2 text-sm">
            <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs">
              {index + 1}
            </span>
            <span>
              {ingredient.quantity} {ingredient.unit} {ingredient.item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};