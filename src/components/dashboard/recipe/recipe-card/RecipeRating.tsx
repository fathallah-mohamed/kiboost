import { useState } from "react";
import { Star, StarHalf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RecipeRatingProps {
  recipeId: string;
  onRatingSubmitted: () => void;
}

export const RecipeRating = ({ recipeId, onRatingSubmitted }: RecipeRatingProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmitRating = async () => {
    if (rating === 0) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('recipe_ratings')
        .upsert({
          recipe_id: recipeId,
          rating,
          comment: comment.trim() || null,
        });

      if (error) throw error;

      toast({
        title: "Évaluation enregistrée",
        description: "Merci pour votre retour !",
      });
      
      onRatingSubmitted();
      setComment("");
      setRating(0);
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'enregistrer l'évaluation.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            onClick={() => setRating(value)}
            className="text-yellow-400 hover:scale-110 transition-transform"
          >
            {value <= rating ? (
              <Star className="w-6 h-6 fill-current" />
            ) : (
              <Star className="w-6 h-6" />
            )}
          </button>
        ))}
      </div>

      <Textarea
        placeholder="Ajoutez un commentaire (optionnel)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="h-24"
      />

      <Button 
        onClick={handleSubmitRating}
        disabled={rating === 0 || isSubmitting}
      >
        Envoyer mon évaluation
      </Button>
    </div>
  );
};