import { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { BackToDashboard } from './BackToDashboard';
import { useAvailableIngredients } from './shopping/hooks/useAvailableIngredients';
import { useShoppingList } from './shopping/hooks/useShoppingList';
import { AvailableIngredientForm } from './shopping/components/AvailableIngredientForm';
import { AvailableIngredientsList } from './shopping/components/AvailableIngredientsList';
import { ShoppingItems } from './shopping/components/ShoppingItems';

interface ShoppingListProps {
  userId: string;
  onSectionChange: (section: string) => void;
}

export const ShoppingList = ({ userId, onSectionChange }: ShoppingListProps) => {
  const { 
    availableIngredients, 
    addIngredient, 
    removeIngredient 
  } = useAvailableIngredients(userId);

  const {
    items,
    loading,
    updateShoppingList,
    fetchItems,
    toggleItemCheck
  } = useShoppingList(userId, availableIngredients);

  useEffect(() => {
    fetchItems();
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
          <AvailableIngredientForm onAdd={addIngredient} />
          <AvailableIngredientsList 
            ingredients={availableIngredients}
            onRemove={removeIngredient}
          />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Liste de courses</h3>
        <ShoppingItems items={items} onToggleCheck={toggleItemCheck} />
      </Card>
    </div>
  );
};