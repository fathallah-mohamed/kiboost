import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Recipe } from "../../types";
import { RecipeHeader } from "./RecipeHeader";
import { RecipeMetadata } from "./RecipeMetadata";
import { RecipeContent } from "./RecipeContent";
import { CompactRecipe } from "./CompactRecipe";
import { RecipeHealthBenefits } from "./RecipeHealthBenefits";

interface RecipeCardProps {
  recipe: Recipe;
  isPlanned?: boolean;
  onAdd?: (recipe: Recipe) => void;
  compact?: boolean;
  index?: number;
}

export const RecipeCard = ({ recipe, isPlanned, onAdd, compact = false, index = 0 }: RecipeCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (compact) {
    return <CompactRecipe recipe={recipe} />;
  }

  const isEven = index % 2 === 0;
  const bgColor = isEven ? 'bg-[#E5DEFF]' : 'bg-[#FEC6A1]';

  return (
    <Card className={`p-6 space-y-6 ${bgColor} transition-colors duration-200 hover:shadow-lg`}>
      <div className="space-y-4">
        <RecipeHeader recipe={recipe} onAdd={onAdd} isPlanned={isPlanned} />
        <RecipeMetadata recipe={recipe} />
        {recipe.health_benefits && recipe.health_benefits.length > 0 && (
          <RecipeHealthBenefits benefits={recipe.health_benefits} />
        )}
        <RecipeContent recipe={recipe} isOpen={isOpen} setIsOpen={setIsOpen} />
      </div>
    </Card>
  );
};