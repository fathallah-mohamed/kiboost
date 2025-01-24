import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { BackToDashboard } from './BackToDashboard';
import { RefreshCw, Plus, Trash2 } from 'lucide-react';

interface ShoppingListProps {
  userId: string;
  onSectionChange: (section: string) => void;
}

interface ShoppingListItem {
  item: string;
  quantity: number;
  unit: string;
  checked: boolean;
}

interface AvailableIngredient {
  id?: string;
  ingredient_name: string;
  quantity: number;
  unit: string;
}

export const ShoppingList = ({ userId, onSectionChange }: ShoppingListProps) => {
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [newIngredient, setNewIngredient] = useState<AvailableIngredient>({
    ingredient_name: '',
    quantity: 0,
    unit: 'g'
  });
  const [availableIngredients, setAvailableIngredients] = useState<AvailableIngredient[]>([]);

  const fetchAvailableIngredients = async () => {
    const { data, error } = await supabase
      .from('available_ingredients')
      .select('*')
      .eq('profile_id', userId);

    if (error) {
      console.error('Error fetching available ingredients:', error);
      return;
    }

    setAvailableIngredients(data || []);
  };

  const addAvailableIngredient = async () => {
    if (!newIngredient.ingredient_name || !newIngredient.quantity) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    const { error } = await supabase
      .from('available_ingredients')
      .insert({
        profile_id: userId,
        ...newIngredient
      });

    if (error) {
      console.error('Error adding ingredient:', error);
      toast.error("Erreur lors de l'ajout de l'ingrédient");
      return;
    }

    toast.success("Ingrédient ajouté avec succès");
    setNewIngredient({
      ingredient_name: '',
      quantity: 0,
      unit: 'g'
    });
    fetchAvailableIngredients();
  };

  const removeAvailableIngredient = async (id: string) => {
    const { error } = await supabase
      .from('available_ingredients')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error removing ingredient:', error);
      toast.error("Erreur lors de la suppression de l'ingrédient");
      return;
    }

    toast.success("Ingrédient supprimé avec succès");
    fetchAvailableIngredients();
  };

  const updateShoppingList = async () => {
    setLoading(true);
    try {
      // Fetch planned recipes for the next week
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);

      const { data: plannedMeals, error: mealsError } = await supabase
        .from('meal_plans')
        .select('*, recipes(*)')
        .eq('profile_id', userId)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0]);

      if (mealsError) throw mealsError;

      // Calculate needed ingredients
      const neededIngredients: { [key: string]: { quantity: number; unit: string } } = {};
      
      plannedMeals?.forEach(meal => {
        const recipe = meal.recipes;
        if (recipe?.ingredients) {
          const ingredients = typeof recipe.ingredients === 'string' 
            ? JSON.parse(recipe.ingredients) 
            : recipe.ingredients;

          ingredients.forEach((ing: any) => {
            const key = ing.item.toLowerCase();
            if (!neededIngredients[key]) {
              neededIngredients[key] = { quantity: 0, unit: ing.unit };
            }
            neededIngredients[key].quantity += parseFloat(ing.quantity);
          });
        }
      });

      // Subtract available ingredients
      availableIngredients.forEach(available => {
        const key = available.ingredient_name.toLowerCase();
        if (neededIngredients[key]) {
          neededIngredients[key].quantity = Math.max(
            0,
            neededIngredients[key].quantity - available.quantity
          );
        }
      });

      // Convert to shopping list items
      const shoppingItems: ShoppingListItem[] = Object.entries(neededIngredients).map(([item, details]) => ({
        item,
        quantity: details.quantity,
        unit: details.unit,
        checked: false
      }));

      // Update shopping list
      const { error: updateError } = await supabase
        .from('shopping_lists')
        .upsert({
          profile_id: userId,
          items: JSON.stringify(shoppingItems)
        });

      if (updateError) throw updateError;

      toast.success("Liste de courses mise à jour avec succès");
      fetchItems();
    } catch (error) {
      console.error('Error updating shopping list:', error);
      toast.error("Erreur lors de la mise à jour de la liste");
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from('shopping_lists')
      .select('*')
      .eq('profile_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching shopping list:', error);
      return;
    }

    if (data?.items) {
      try {
        const parsedItems = typeof data.items === 'string' 
          ? JSON.parse(data.items) 
          : data.items;
        setItems(parsedItems);
      } catch (e) {
        console.error('Error parsing shopping list items:', e);
        setItems([]);
      }
    } else {
      setItems([]);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchAvailableIngredients();
  }, [userId]);

  return (
    <div className="space-y-6">
      <BackToDashboard onBack={() => onSectionChange('overview')} />
      
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Liste de courses</h2>
        <Button 
          onClick={updateShoppingList} 
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Mettre à jour
        </Button>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Ingrédients disponibles</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ingredient">Ingrédient</Label>
              <Input
                id="ingredient"
                value={newIngredient.ingredient_name}
                onChange={(e) => setNewIngredient(prev => ({
                  ...prev,
                  ingredient_name: e.target.value
                }))}
                placeholder="Nom de l'ingrédient"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantité</Label>
              <Input
                id="quantity"
                type="number"
                value={newIngredient.quantity}
                onChange={(e) => setNewIngredient(prev => ({
                  ...prev,
                  quantity: parseFloat(e.target.value)
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unité</Label>
              <Input
                id="unit"
                value={newIngredient.unit}
                onChange={(e) => setNewIngredient(prev => ({
                  ...prev,
                  unit: e.target.value
                }))}
                placeholder="g, ml, etc."
              />
            </div>
            <div className="flex items-end">
              <Button onClick={addAvailableIngredient} className="w-full gap-2">
                <Plus className="w-4 h-4" />
                Ajouter
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {availableIngredients.map((ingredient) => (
              <div key={ingredient.id} className="flex items-center justify-between p-2 bg-secondary/20 rounded-lg">
                <span>
                  {ingredient.ingredient_name} - {ingredient.quantity} {ingredient.unit}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => ingredient.id && removeAvailableIngredient(ingredient.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Liste de courses</h3>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-secondary/20 rounded-lg">
              <span>
                {item.item} - {item.quantity} {item.unit}
              </span>
              <input
                type="checkbox"
                checked={item.checked}
                onChange={async () => {
                  const newItems = [...items];
                  newItems[index] = { ...item, checked: !item.checked };
                  setItems(newItems);
                  
                  await supabase
                    .from('shopping_lists')
                    .upsert({
                      profile_id: userId,
                      items: newItems
                    });
                }}
                className="w-5 h-5"
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};