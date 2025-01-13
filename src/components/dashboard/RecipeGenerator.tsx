import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, ChefHat } from 'lucide-react';

interface ChildProfile {
  id: string;
  name: string;
  age: number;
  allergies: string[];
  preferences: string[];
}

interface Recipe {
  id: string;
  name: string;
  ingredients: Array<{
    item: string;
    quantity: string;
    unit: string;
  }>;
  instructions: string[];
  nutritional_info: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

interface RecipeGeneratorProps {
  selectedChild: ChildProfile | null;
}

export const RecipeGenerator = ({ selectedChild }: RecipeGeneratorProps) => {
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const { toast } = useToast();

  const generateRecipe = async () => {
    if (!selectedChild) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez sélectionner un profil d'enfant",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Non authentifié");

      const response = await supabase.functions.invoke('generate-recipe', {
        body: {
          childProfile: {
            age: selectedChild.age,
            allergies: selectedChild.allergies,
            preferences: selectedChild.preferences,
          },
        },
      });

      if (response.error) throw response.error;
      
      setRecipe(response.data);
      toast({
        title: "Recette générée",
        description: "Une nouvelle recette a été créée pour " + selectedChild.name,
      });
    } catch (error: any) {
      console.error('Error generating recipe:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de générer la recette: " + error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Générateur de recettes</h2>
        <Button 
          onClick={generateRecipe} 
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <ChefHat className="w-4 h-4 mr-2" />
          )}
          Générer une recette
        </Button>
      </div>

      {recipe && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">{recipe.name}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Ingrédients</h4>
              <ul className="list-disc list-inside space-y-1">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index}>
                    {ingredient.quantity} {ingredient.unit} {ingredient.item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Instructions</h4>
              <ol className="list-decimal list-inside space-y-1">
                {recipe.instructions.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="font-semibold mb-2">Informations nutritionnelles</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-2 bg-secondary/20 rounded">
                <div className="font-semibold">{recipe.nutritional_info.calories}</div>
                <div className="text-sm text-muted-foreground">Calories</div>
              </div>
              <div className="text-center p-2 bg-secondary/20 rounded">
                <div className="font-semibold">{recipe.nutritional_info.protein}g</div>
                <div className="text-sm text-muted-foreground">Protéines</div>
              </div>
              <div className="text-center p-2 bg-secondary/20 rounded">
                <div className="font-semibold">{recipe.nutritional_info.carbs}g</div>
                <div className="text-sm text-muted-foreground">Glucides</div>
              </div>
              <div className="text-center p-2 bg-secondary/20 rounded">
                <div className="font-semibold">{recipe.nutritional_info.fat}g</div>
                <div className="text-sm text-muted-foreground">Lipides</div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};