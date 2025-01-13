import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Recipe } from "../../types";
import { Clock, Heart, Share2, CalendarPlus, Gauge, Cookie, Beef, Wheat } from "lucide-react";
import { NutritionalGauge } from "./NutritionalGauge";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RecipeCardProps {
  recipe: Recipe;
  isPlanned?: boolean;
  onAdd?: (recipe: Recipe) => void;
  compact?: boolean;  // Added this prop
}

export const RecipeCard = ({ recipe, isPlanned, onAdd, compact = false }: RecipeCardProps) => {
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
      <Card className="p-2">
        <div className="flex items-center gap-2">
          <img 
            src={recipe.image_url} 
            alt={recipe.name}
            className="w-12 h-12 rounded object-cover"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium truncate">{recipe.name}</h4>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Clock className="w-3 h-3" />
              <span>{recipe.preparation_time} min</span>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <img 
          src={recipe.image_url} 
          alt={recipe.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            variant="secondary"
            size="icon"
            className="bg-white/90 hover:bg-white"
            onClick={toggleFavorite}
          >
            <Heart 
              className="w-4 h-4" 
              fill={isFavorite ? "currentColor" : "none"} 
            />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="bg-white/90 hover:bg-white"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-2xl font-bold text-primary mb-2">{recipe.name}</h3>
          <div className="flex items-center gap-4 text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{recipe.preparation_time} min</span>
            </div>
            <div className="flex items-center gap-1">
              <Gauge className="w-4 h-4" />
              <span>{recipe.nutritional_info.calories} kcal</span>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <NutritionalGauge
            value={recipe.nutritional_info.carbs}
            maxValue={100}
            label="Glucides"
            icon={<Cookie className="w-4 h-4" />}
          />
          <NutritionalGauge
            value={recipe.nutritional_info.protein}
            maxValue={50}
            label="Protéines"
            icon={<Beef className="w-4 h-4" />}
          />
          <NutritionalGauge
            value={recipe.nutritional_info.fat}
            maxValue={50}
            label="Lipides"
            icon={<Wheat className="w-4 h-4" />}
          />
        </div>

        <p className="text-sm text-gray-600 bg-secondary/20 p-4 rounded-lg">
          Cette recette est particulièrement riche en protéines et fibres, idéale pour la croissance 
          et le développement de votre enfant. Les ingrédients choisis favorisent la concentration 
          et l'énergie tout au long de la journée.
        </p>

        {onAdd && (
          <div className="flex justify-center">
            <Button
              onClick={() => onAdd(recipe)}
              disabled={isPlanned}
              className="w-full sm:w-auto"
              size="lg"
            >
              <CalendarPlus className="w-5 h-5 mr-2" />
              {isPlanned ? 'Déjà planifiée' : 'Planifier cette recette'}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};