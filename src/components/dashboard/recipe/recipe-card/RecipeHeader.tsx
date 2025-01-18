import { Button } from "@/components/ui/button";
import { Heart, Share2 } from "lucide-react";
import { Recipe } from "../../types";
import { useToast } from "@/components/ui/use-toast";
import { useFavorites } from "../hooks/useFavorites";

interface RecipeHeaderProps {
  recipe: Recipe;
  onAdd?: (recipe: Recipe) => void;
  isPlanned?: boolean;
}

export const RecipeHeader = ({ 
  recipe, 
  onAdd, 
  isPlanned,
}: RecipeHeaderProps) => {
  const { toast } = useToast();
  const { favoriteRecipes, toggleFavorite } = useFavorites();
  const isFavorite = favoriteRecipes.includes(recipe.id);

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
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => toggleFavorite(recipe)}
          className={isFavorite ? 'text-primary' : ''}
        >
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