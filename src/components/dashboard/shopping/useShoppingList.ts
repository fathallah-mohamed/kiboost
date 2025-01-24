import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ShoppingItem } from '../types/shopping';
import { Json } from '@/integrations/supabase/types';

export const useShoppingList = (userId: string) => {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [userId]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data: shoppingList, error } = await supabase
        .from('shopping_lists')
        .select('items')
        .eq('profile_id', userId)
        .maybeSingle();

      if (error) throw error;

      if (shoppingList?.items) {
        // Parse the items from JSON and ensure they match ShoppingItem type
        const parsedItems = (Array.isArray(shoppingList.items) 
          ? shoppingList.items 
          : JSON.parse(shoppingList.items as string)) as ShoppingItem[];
        setItems(parsedItems);
      }
    } catch (error) {
      console.error('Error fetching shopping list:', error);
      toast.error('Erreur lors du chargement de la liste de courses');
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (name: string) => {
    try {
      setLoading(true);
      const newItem: ShoppingItem = {
        id: crypto.randomUUID(),
        name,
        completed: false,
      };

      const updatedItems = [...items, newItem];
      
      const { error } = await supabase
        .from('shopping_lists')
        .upsert({ 
          profile_id: userId, 
          items: updatedItems
        });

      if (error) throw error;

      setItems(updatedItems);
      toast.success('Article ajouté à la liste');
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error('Erreur lors de l\'ajout de l\'article');
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      setLoading(true);
      const updatedItems = items.filter(item => item.id !== itemId);
      
      const { error } = await supabase
        .from('shopping_lists')
        .upsert({ 
          profile_id: userId, 
          items: updatedItems
        });

      if (error) throw error;

      setItems(updatedItems);
      toast.success('Article supprimé de la liste');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Erreur lors de la suppression de l\'article');
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = async (item: ShoppingItem) => {
    try {
      setLoading(true);
      const updatedItems = items.map(i => 
        i.id === item.id ? { ...i, completed: !i.completed } : i
      );
      
      const { error } = await supabase
        .from('shopping_lists')
        .upsert({ 
          profile_id: userId, 
          items: updatedItems
        });

      if (error) throw error;

      setItems(updatedItems);
    } catch (error) {
      console.error('Error toggling item:', error);
      toast.error('Erreur lors de la mise à jour de l\'article');
    } finally {
      setLoading(false);
    }
  };

  return {
    items,
    loading,
    addItem,
    removeItem,
    toggleItem,
  };
};