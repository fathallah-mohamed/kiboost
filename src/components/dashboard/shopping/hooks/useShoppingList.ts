import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ShoppingListItem } from '../types';
import { Json } from '@/integrations/supabase/types';

export const useShoppingList = (userId: string, availableIngredients: any[]) => {
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState(false);

  const updateShoppingList = async () => {
    setLoading(true);
    try {
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

      availableIngredients.forEach(available => {
        const key = available.ingredient_name.toLowerCase();
        if (neededIngredients[key]) {
          neededIngredients[key].quantity = Math.max(
            0,
            neededIngredients[key].quantity - available.quantity
          );
        }
      });

      const shoppingItems: ShoppingListItem[] = Object.entries(neededIngredients)
        .filter(([_, details]) => details.quantity > 0)
        .map(([item, details]) => ({
          item,
          quantity: details.quantity,
          unit: details.unit,
          checked: false
        }));

      const { error: updateError } = await supabase
        .from('shopping_lists')
        .upsert({
          profile_id: userId,
          items: shoppingItems as unknown as Json
        });

      if (updateError) throw updateError;

      setItems(shoppingItems);
      toast.success("Liste de courses mise à jour avec succès");
    } catch (error) {
      console.error('Error updating shopping list:', error);
      toast.error("Erreur lors de la mise à jour de la liste");
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('shopping_lists')
        .select('*')
        .eq('profile_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching shopping list:', error);
        return;
      }

      if (data?.items) {
        const parsedItems = Array.isArray(data.items) 
          ? (data.items as unknown as ShoppingListItem[])
          : [];
        setItems(parsedItems);
      } else {
        setItems([]);
      }
    } catch (e) {
      console.error('Error parsing shopping list items:', e);
      setItems([]);
    }
  };

  const toggleItemCheck = async (index: number) => {
    const newItems = [...items];
    newItems[index] = { ...items[index], checked: !items[index].checked };
    setItems(newItems);
    
    await supabase
      .from('shopping_lists')
      .upsert({
        profile_id: userId,
        items: newItems as unknown as Json
      });
  };

  return {
    items,
    loading,
    updateShoppingList,
    fetchItems,
    toggleItemCheck
  };
};