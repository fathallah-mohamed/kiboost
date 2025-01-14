import { Button } from "@/components/ui/button";
import { Heart, Share2 } from "lucide-react";
import { Recipe } from "../../types";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

interface RecipeHeaderProps {
  recipe: Recipe;
  onAdd?: (recipe: Recipe) => void;
  isPlanned?: boolean;
}

export const RecipeHeader = ({ recipe, onAdd, isPlanned }: RecipeHeaderProps) => {
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

  return (
    <div className="flex justify-between items-start">
      <h3 className="text-2xl font-bold text-primary">{recipe.name}</h3>
      <div className="flex gap-2">
        <Button variant="ghost" size="icon" onClick={handleShare}>
          <Share2 className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={toggleFavorite}>
          <Heart className="w-4 h-4" fill={isFavorite ? "currentColor" : "none"} />
        </Button>
        {onAdd && (
          <Button onClick={() => onAdd(recipe)} disabled={isPlanned}>
            {isPlanned ? 'Déjà planifiée' : 'Planifier'}
          </Button>
        )}
      </div>
    </div>
  );
};