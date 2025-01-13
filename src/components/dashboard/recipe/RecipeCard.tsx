import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Recipe } from "../types";
import { 
  Utensils, Clock, Heart, Beef, Wheat, 
  Flame, Cookie, Star, Share2
} from "lucide-react";
import { RecipeRating } from "./RecipeRating";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface RecipeCardProps {
  recipe: Recipe;
  compact?: boolean;
}

export const RecipeCard = ({ recipe, compact = false }: RecipeCardProps) => {
  const [showRating, setShowRating] = useState(false);
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
      console.error('Error toggling favorite:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue.",
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

  if (compact) {
    return (
      <div className="text-sm">
        <h4 className="font-medium">{recipe.name}</h4>
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {recipe.preparation_time}min
          </span>
          <span className="flex items-center gap-1">
            <Utensils className="w-3 h-3" />
            {recipe.difficulty}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-primary mb-2">{recipe.name}</h3>
        <div className="flex justify-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {recipe.preparation_time} min
          </span>
          <span className="flex items-center gap-1">
            <Utensils className="w-4 h-4" />
            {recipe.difficulty}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            {recipe.meal_type}
          </span>
        </div>
        <div className="flex justify-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFavorite}
            className={isFavorite ? "text-red-500" : ""}
          >
            <Heart className="w-4 h-4 mr-2" fill={isFavorite ? "currentColor" : "none"} />
            {isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRating(!showRating)}
          >
            <Star className="w-4 h-4 mr-2" />
            Évaluer
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Partager
          </Button>
        </div>
      </div>

      {showRating && (
        <Card className="p-4">
          <RecipeRating 
            recipeId={recipe.id}
            onRatingSubmitted={() => setShowRating(false)}
          />
        </Card>
      )}

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