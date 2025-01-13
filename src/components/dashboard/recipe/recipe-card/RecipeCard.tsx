import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Clock, Eye, Plus, Droplet, Candy, Cookie } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { NutritionalBadge } from "./NutritionalBadge";
import { HealthScore } from "./HealthScore";
import { DietaryLabel } from "./DietaryLabel";
import { Recipe } from "../../types";

interface RecipeCardProps {
  recipe: Recipe;
  onAdd?: (recipe: Recipe) => void;
  isPlanned?: boolean;
}

export const RecipeCard = ({ recipe, onAdd, isPlanned }: RecipeCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();

  const getSugarScore = () => {
    const carbs = recipe.nutritional_info.carbs;
    if (carbs < 30) return 'low';
    if (carbs < 60) return 'medium';
    return 'high';
  };

  const getFatScore = () => {
    const fat = recipe.nutritional_info.fat;
    if (fat < 10) return 'low';
    if (fat < 20) return 'medium';
    return 'high';
  };

  const handleAdd = () => {
    if (onAdd) {
      onAdd(recipe);
      toast({
        title: "Recette ajoutée",
        description: "La recette a été ajoutée au planificateur",
      });
    }
  };

  return (
    <>
      <Card className="p-4 hover:shadow-lg transition-shadow duration-200">
        <div className="space-y-4">
          {/* En-tête */}
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-primary">{recipe.name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {recipe.preparation_time} min
              </span>
            </div>
          </div>

          {/* Labels diététiques */}
          <div className="flex flex-wrap gap-2">
            <DietaryLabel type="bio" />
            <DietaryLabel type="gluten-free" />
            <DietaryLabel type="low-sugar" />
          </div>

          {/* Valeurs nutritionnelles */}
          <div className="grid grid-cols-2 gap-2">
            <NutritionalBadge
              label="Calories"
              value={recipe.nutritional_info.calories}
              unit="calories"
              variant="calories"
            />
            <NutritionalBadge
              label="Protéines"
              value={recipe.nutritional_info.protein}
              variant="protein"
            />
            <NutritionalBadge
              label="Glucides"
              value={recipe.nutritional_info.carbs}
              variant="carbs"
            />
            <NutritionalBadge
              label="Lipides"
              value={recipe.nutritional_info.fat}
              variant="fat"
            />
          </div>

          {/* Scores de santé */}
          <div className="grid grid-cols-2 gap-2">
            <HealthScore
              label="Sucres"
              score={getSugarScore()}
              icon={<Candy className="w-4 h-4" />}
            />
            <HealthScore
              label="Gras"
              score={getFatScore()}
              icon={<Droplet className="w-4 h-4" />}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowDetails(true)}
            >
              <Eye className="w-4 h-4 mr-2" />
              Détails
            </Button>
            {onAdd && (
              <Button
                className="flex-1"
                onClick={handleAdd}
                disabled={isPlanned}
              >
                <Plus className="w-4 h-4 mr-2" />
                {isPlanned ? 'Déjà planifiée' : 'Ajouter'}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Modal de détails */}
      <Sheet open={showDetails} onOpenChange={setShowDetails}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{recipe.name}</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            <div>
              <h4 className="font-semibold mb-2">Ingrédients</h4>
              <ul className="list-disc pl-4 space-y-1">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index}>
                    {ingredient.quantity} {ingredient.unit} {ingredient.item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Instructions</h4>
              <ol className="list-decimal pl-4 space-y-2">
                {recipe.instructions.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};