import { Beef, Cookie, Flame, Wheat } from "lucide-react";
import { Recipe } from "../../types";

interface RecipeNutritionalInfoProps {
  recipe: Recipe;
}

export const RecipeNutritionalInfo = ({ recipe }: RecipeNutritionalInfoProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50">
        <Flame className="w-5 h-5 text-red-500" />
        <div>
          <div className="text-sm font-medium">Calories</div>
          <div className="text-lg font-bold text-red-600">
            {recipe.nutritional_info.calories}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50">
        <Beef className="w-5 h-5 text-blue-500" />
        <div>
          <div className="text-sm font-medium">Protéines</div>
          <div className="text-lg font-bold text-blue-600">
            {recipe.nutritional_info.protein}g
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50">
        <Wheat className="w-5 h-5 text-yellow-500" />
        <div>
          <div className="text-sm font-medium">Glucides</div>
          <div className="text-lg font-bold text-yellow-600">
            {recipe.nutritional_info.carbs}g
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 p-3 rounded-lg bg-purple-50">
        <Cookie className="w-5 h-5 text-purple-500" />
        <div>
          <div className="text-sm font-medium">Lipides</div>
          <div className="text-lg font-bold text-purple-600">
            {recipe.nutritional_info.fat}g
          </div>
        </div>
      </div>
    </div>
  );
};