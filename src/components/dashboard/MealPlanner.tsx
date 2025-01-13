import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Recipe } from './types';
import { RecipeCard } from './recipe/RecipeCard';

interface MealPlannerProps {
  userId: string;
}

export const MealPlanner = ({ userId }: MealPlannerProps) => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [planningRecipe, setPlanningRecipe] = useState(false);

  useEffect(() => {
    fetchRecipes();
    fetchPlannedRecipe();
  }, [selectedDate]);

  const fetchRecipes = async () => {
    try {
      console.log('Fetching recipes for user:', userId);
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('profile_id', userId);

      if (error) {
        console.error('Error fetching recipes:', error);
        throw error;
      }

      console.log('Fetched recipes:', data);

      // Parse JSON data
      const parsedRecipes: Recipe[] = data?.map(recipe => ({
        ...recipe,
        ingredients: typeof recipe.ingredients === 'string' 
          ? JSON.parse(recipe.ingredients) 
          : recipe.ingredients,
        nutritional_info: typeof recipe.nutritional_info === 'string'
          ? JSON.parse(recipe.nutritional_info)
          : recipe.nutritional_info,
        instructions: Array.isArray(recipe.instructions)
          ? recipe.instructions
          : [recipe.instructions].filter(Boolean)
      })) || [];

      console.log('Parsed recipes:', parsedRecipes);
      setRecipes(parsedRecipes);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les recettes.",
      });
    }
  };

  const fetchPlannedRecipe = async () => {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .select('*, recipes(*)')
        .eq('profile_id', userId)
        .eq('date', format(selectedDate, 'yyyy-MM-dd'))
        .maybeSingle();

      if (error) throw error;

      if (data?.recipes) {
        const recipe = data.recipes;
        const parsedRecipe: Recipe = {
          ...recipe,
          ingredients: typeof recipe.ingredients === 'string'
            ? JSON.parse(recipe.ingredients)
            : recipe.ingredients,
          nutritional_info: typeof recipe.nutritional_info === 'string'
            ? JSON.parse(recipe.nutritional_info)
            : recipe.nutritional_info,
          instructions: Array.isArray(recipe.instructions)
            ? recipe.instructions
            : [recipe.instructions].filter(Boolean)
        };
        setSelectedRecipe(parsedRecipe);
      } else {
        setSelectedRecipe(null);
      }
    } catch (error) {
      console.error('Error fetching planned recipe:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger le planning.",
      });
    } finally {
      setLoading(false);
    }
  };

  const planRecipe = async (recipe: Recipe) => {
    setPlanningRecipe(true);
    try {
      // Supprimer le planning existant pour cette date s'il existe
      await supabase
        .from('meal_plans')
        .delete()
        .eq('profile_id', userId)
        .eq('date', format(selectedDate, 'yyyy-MM-dd'));

      // Ajouter le nouveau planning
      const { error } = await supabase
        .from('meal_plans')
        .insert({
          profile_id: userId,
          recipe_id: recipe.id,
          date: format(selectedDate, 'yyyy-MM-dd'),
        });

      if (error) throw error;

      setSelectedRecipe(recipe);
      toast({
        title: "Planification réussie",
        description: "La recette a été planifiée pour le " + format(selectedDate, 'dd MMMM yyyy', { locale: fr }),
      });
    } catch (error) {
      console.error('Error planning recipe:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de planifier la recette.",
      });
    } finally {
      setPlanningRecipe(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Planificateur de repas</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Card className="p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
              locale={fr}
            />
          </Card>

          {selectedRecipe && (
            <Card className="mt-4 p-4">
              <h3 className="text-lg font-semibold mb-2">
                Recette planifiée pour le {format(selectedDate, 'dd MMMM yyyy', { locale: fr })}
              </h3>
              <RecipeCard recipe={selectedRecipe} />
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Recettes disponibles</h3>
          {loading ? (
            <p>Chargement des recettes...</p>
          ) : recipes.length === 0 ? (
            <p>Aucune recette disponible. Générez d'abord des recettes dans l'onglet "Recettes".</p>
          ) : (
            recipes.map((recipe) => (
              <Card key={recipe.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{recipe.name}</h4>
                    <p className="text-sm text-gray-500">
                      {recipe.nutritional_info.calories} calories
                    </p>
                  </div>
                  <Button 
                    onClick={() => planRecipe(recipe)}
                    disabled={planningRecipe}
                  >
                    Planifier
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};