import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Clock, ArrowRight, Plus, Heart, Star, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Recipe } from "../../types";

interface RecipeCardProps {
  recipe: Recipe;
  onAdd?: (recipe: Recipe) => void;
  isPlanned?: boolean;
}

export const RecipeCard = ({ recipe, onAdd, isPlanned }: RecipeCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();

  const handleAdd = () => {
    if (onAdd) {
      onAdd(recipe);
      toast({
        title: "Recette ajoutée",
        description: "La recette a été ajoutée au planificateur",
      });
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: recipe.name,
        text: `Découvre cette délicieuse recette : ${recipe.name}`,
        url: window.location.href,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <>
      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg">
        <div className="p-6 space-y-4">
          {/* En-tête de la recette */}
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-primary group-hover:text-primary/80 transition-colors">
              {recipe.name}
            </h3>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {recipe.preparation_time} min
              </span>
              <span className="text-2xl">•</span>
              <span className="capitalize">{recipe.difficulty}</span>
            </div>
          </div>

          {/* Informations nutritionnelles simplifiées */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{recipe.nutritional_info.calories} calories</span>
            <span>{recipe.nutritional_info.protein}g protéines</span>
          </div>

          {/* Actions principales */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 group-hover:bg-accent/5"
              onClick={() => setShowDetails(true)}
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Afficher détails
            </Button>
            <Button
              className="flex-1"
              onClick={handleAdd}
              disabled={isPlanned}
            >
              <Plus className="w-4 h-4 mr-2" />
              {isPlanned ? 'Déjà planifiée' : 'Planifier'}
            </Button>
          </div>

          {/* Actions secondaires */}
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="ghost" size="sm">
              <Heart className="w-4 h-4 mr-2" />
              Favoris
            </Button>
            <Button variant="ghost" size="sm">
              <Star className="w-4 h-4 mr-2" />
              Évaluer
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Partager
            </Button>
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