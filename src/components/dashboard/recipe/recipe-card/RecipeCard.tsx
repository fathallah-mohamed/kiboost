import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Recipe } from "../../types";
import { RecipeHeader } from "./RecipeHeader";
import { RecipeMetadata } from "./RecipeMetadata";
import { RecipeContent } from "./RecipeContent";
import { CompactRecipe } from "./CompactRecipe";

interface RecipeCardProps {
  recipe: Recipe;
  isPlanned?: boolean;
  onAdd?: (recipe: Recipe) => void;
  compact?: boolean;
}

export const RecipeCard = ({ recipe, isPlanned, onAdd, compact = false }: RecipeCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (compact) {
    return <CompactRecipe recipe={recipe} />;
  }

  return (
    <Card className="p-6 space-y-6">
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