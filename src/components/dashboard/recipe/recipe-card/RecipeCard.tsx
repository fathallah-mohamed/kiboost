import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Recipe } from "../../types";
import { Clock, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { RecipeHeader } from "./RecipeHeader";
import { RecipeHealthBenefits } from "./RecipeHealthBenefits";
import { RecipeMetadata } from "./RecipeMetadata";
import { RecipeNutritionalInfo } from "./RecipeNutritionalInfo";

interface RecipeCardProps {
  recipe: Recipe;
  isPlanned?: boolean;
  onAdd?: (recipe: Recipe) => void;
  compact?: boolean;
}

export const RecipeCard = ({ recipe, isPlanned, onAdd, compact }: RecipeCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="overflow-hidden">
      {!compact && (
        <div className="relative">
          <img 
            src={recipe.image_url} 
            alt={recipe.name}
            className="w-full h-48 object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <div className="flex items-center gap-2 text-white">
              <Clock className="w-4 h-4" />
              <span>{recipe.preparation_time} min</span>
            </div>
          </div>
        </div>
      )}

      <div className="p-6">
        <div className="space-y-4">
          <RecipeHeader recipe={recipe} />
          
          {recipe.health_benefits && recipe.health_benefits.length > 0 && (
            <RecipeHealthBenefits benefits={recipe.health_benefits} />
          )}

          <RecipeMetadata recipe={recipe} />

          {!compact && (
            <>
              <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CollapsibleContent className="space-y-6 mt-4">
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
          )}

          {onAdd && (
            <Button 
              onClick={() => onAdd(recipe)} 
              disabled={isPlanned}
              className="w-full"
            >
              {isPlanned ? 'Déjà planifiée' : 'Planifier'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};