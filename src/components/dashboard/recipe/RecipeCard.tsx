import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Recipe } from "../types";
import { Clock, Heart, Star, ChevronDown, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface RecipeCardProps {
  recipe: Recipe;
  isPlanned?: boolean;
  isNew?: boolean;
  onAdd?: (recipe: Recipe) => void;
  compact?: boolean;
}

export const RecipeCard = ({ recipe, isPlanned, isNew, onAdd, compact = false }: RecipeCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const { toast } = useToast();

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('recipe_favorites')
          .delete()
          .eq('recipe_id', recipe.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('recipe_favorites')
          .insert({ recipe_id: recipe.id });
        
        if (error) throw error;
      }

      setIsFavorite(!isFavorite);
      toast({
        title: isFavorite ? "Retiré des favoris" : "Ajouté aux favoris",
        description: isFavorite 
          ? "La recette a été retirée de vos favoris"
          : "La recette a été ajoutée à vos favoris",
      });
    } catch (error) {
      console.error('Erreur lors de la modification des favoris:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue.",
      });
    }
  };

  if (compact) {
    return (
      <div className="p-2 bg-background rounded-lg border">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-sm">{recipe.name}</h4>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <Clock className="w-3 h-3" />
              <span>{recipe.preparation_time} min</span>
              <Star className="w-3 h-3 ml-2" />
              <span>{recipe.meal_type}</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={toggleFavorite}>
            <Heart className="w-4 h-4" fill={isFavorite ? "currentColor" : "none"} />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
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

      <div className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="text-2xl font-bold text-primary">{recipe.name}</h3>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={toggleFavorite}>
                <Heart className="w-4 h-4" fill={isFavorite ? "currentColor" : "none"} />
              </Button>
              {onAdd && (
                <Button 
                  onClick={() => onAdd(recipe)} 
                  disabled={isPlanned}
                  className="flex items-center gap-2"
                >
                  {isPlanned ? (
                    <>
                      <Users className="w-4 h-4" />
                      Déjà planifié
                    </>
                  ) : (
                    'Planifier'
                  )}
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4" />
              {recipe.meal_type}
            </span>
          </div>

          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleContent className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Ingrédients</h4>
                  <ul className="space-y-1 text-sm">
                    {recipe.ingredients.map((ingredient, index) => (
                      <li key={index}>
                        {ingredient.quantity} {ingredient.unit} {ingredient.item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Instructions</h4>
                  <ol className="space-y-1 text-sm list-decimal list-inside">
                    {recipe.instructions.map((instruction, index) => (
                      <li key={index}>{instruction}</li>
                    ))}
                  </ol>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-secondary/20 p-2 rounded-lg">
                  <div className="font-medium">Calories</div>
                  <div className="text-lg font-bold">{recipe.nutritional_info.calories}</div>
                </div>
                <div className="bg-secondary/20 p-2 rounded-lg">
                  <div className="font-medium">Protéines</div>
                  <div className="text-lg font-bold">{recipe.nutritional_info.protein}g</div>
                </div>
              </div>
            </CollapsibleContent>

            <Button
              variant="ghost"
              onClick={() => setIsOpen(!isOpen)}
              className="w-full mt-4"
            >
              <ChevronDown className={`w-4 h-4 mr-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
              {isOpen ? 'Masquer les détails' : 'Voir les détails'}
            </Button>
          </Collapsible>
        </div>
      </div>
    </Card>
  );
};