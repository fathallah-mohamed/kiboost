import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { Recipe } from "../../types";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { RecipeIngredients } from "./RecipeIngredients";
import { RecipeInstructions } from "./RecipeInstructions";
import { RecipeNutritionalInfo } from "./RecipeNutritionalInfo";

interface RecipeContentProps {
  recipe: Recipe;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const RecipeContent = ({ recipe, isOpen, setIsOpen }: RecipeContentProps) => {
  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleContent className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RecipeIngredients ingredients={recipe.ingredients} />
            <RecipeInstructions instructions={recipe.instructions} />
          </div>
          <RecipeNutritionalInfo recipe={recipe} />
        </CollapsibleContent>
      </Collapsible>

      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full md:w-auto"
        >
          <ChevronDown className={`w-4 h-4 mr-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          {isOpen ? 'Masquer la recette' : 'Afficher la recette'}
        </Button>
      </div>
    </>
  );
};