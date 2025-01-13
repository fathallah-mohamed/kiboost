import { Card } from "@/components/ui/card";
import { Recipe } from "../types";
import { Utensils, Clock, Heart, Beef, Wheat, Flame, Cookie } from "lucide-react";

interface RecipeCardProps {
  recipe: Recipe;
}

export const RecipeCard = ({ recipe }: RecipeCardProps) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-primary mb-2">{recipe.name}</h3>
        <div className="flex justify-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Utensils className="w-4 h-4" />
            Facile
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            15 min
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            Healthy
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4 bg-secondary/10">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Utensils className="w-4 h-4 text-primary" />
            Ingrédients
          </h4>
          <ul className="space-y-2">
            {recipe.ingredients.map((ingredient, index) => (
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
        </Card>

        <Card className="p-4 bg-secondary/10">
          <h4 className="font-semibold mb-4">Instructions</h4>
          <ol className="space-y-2">
            {recipe.instructions.map((step, index) => (
              <li key={index} className="flex gap-2 text-sm">
                <span className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-xs shrink-0">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      <Card className="p-4">
        <h4 className="font-semibold mb-4 text-center">Valeurs nutritionnelles</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50">
            <Flame className="w-5 h-5 text-red-500" />
            <div>
              <div className="text-sm font-medium">Calories</div>
              <div className="text-lg font-bold text-red-600">{recipe.nutritional_info.calories}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50">
            <Beef className="w-5 h-5 text-blue-500" />
            <div>
              <div className="text-sm font-medium">Protéines</div>
              <div className="text-lg font-bold text-blue-600">{recipe.nutritional_info.protein}g</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50">
            <Wheat className="w-5 h-5 text-yellow-500" />
            <div>
              <div className="text-sm font-medium">Glucides</div>
              <div className="text-lg font-bold text-yellow-600">{recipe.nutritional_info.carbs}g</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-purple-50">
            <Cookie className="w-5 h-5 text-purple-500" />
            <div>
              <div className="text-sm font-medium">Lipides</div>
              <div className="text-lg font-bold text-purple-600">{recipe.nutritional_info.fat}g</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};