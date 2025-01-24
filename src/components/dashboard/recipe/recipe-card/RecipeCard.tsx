import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Recipe } from "../../types";
import { 
  Utensils, Clock, Heart, Beef, Wheat, 
  Flame, Cookie, Star, ChevronDown
} from "lucide-react";
import { RecipeRating } from "../RecipeRating";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { RecipeHealthBenefits } from "./RecipeHealthBenefits";
import { cn } from "@/lib/utils";

interface RecipeCardProps {
  recipe: Recipe;
  isPlanned?: boolean;
  isNew?: boolean;
  onAdd?: (recipe: Recipe) => void;
  compact?: boolean;
}

export const RecipeCard = ({ recipe, isPlanned, isNew, onAdd, compact }: RecipeCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const { toast } = useToast();

  const handleAdd = () => {
    if (!recipe.id) {
      console.error('Recipe ID is missing:', recipe);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'ajouter la recette au planificateur. ID manquant.",
      });
      return;
    }
    onAdd?.(recipe);
  };

  if (compact) {
    return (
      <div className={cn(
        "p-4 border rounded-lg transition-all duration-500",
        isNew && "bg-gradient-to-r from-purple-50 to-blue-50 border-primary shadow-lg"
      )}>
        <h4 className="font-medium">{recipe.name}</h4>
        {isNew && (
          <span className="inline-block px-2 py-1 text-xs font-medium text-primary bg-primary/10 rounded-full mb-2">
            Nouvelle recette
          </span>
        )}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {recipe.preparation_time} min
          </span>
          <span className="flex items-center gap-1">
            <Star className="w-4 h-4" />
            {recipe.meal_type}
          </span>
        </div>
        {recipe.health_benefits && (
          <div className="mt-2">
            <RecipeHealthBenefits benefits={recipe.health_benefits} compact />
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-500",
      isNew && "bg-gradient-to-r from-purple-50 to-blue-50 border-primary shadow-lg"
    )}>
      <div className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-bold text-primary">{recipe.name}</h3>
              {isNew && (
                <span className="inline-block px-2 py-1 text-xs font-medium text-primary bg-primary/10 rounded-full mt-1">
                  Nouvelle recette
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsFavorite(!isFavorite)}>
                <Heart className="w-4 h-4" fill={isFavorite ? "currentColor" : "none"} />
              </Button>
              {onAdd && (
                <Button 
                  onClick={handleAdd} 
                  disabled={isPlanned}
                  className="whitespace-nowrap"
                  variant={isPlanned ? "secondary" : "default"}
                >
                  {isPlanned ? 'Déjà planifiée' : 'Ajouter au planificateur'}
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {recipe.preparation_time} min
            </span>
            <span className="flex items-center gap-1">
              <Utensils className="w-4 h-4" />
              {recipe.difficulty}
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4" />
              {recipe.meal_type}
            </span>
          </div>

          {recipe.health_benefits && (
            <RecipeHealthBenefits benefits={recipe.health_benefits} />
          )}

          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleContent className="space-y-6 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
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
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Instructions</h4>
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
                </div>
              </div>

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
        </div>
      </div>
    </Card>
  );
};