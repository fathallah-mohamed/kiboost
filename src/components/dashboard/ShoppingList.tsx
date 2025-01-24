import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { BackToDashboard } from './BackToDashboard';
import { StepNavigation } from './navigation/StepNavigation';
import { useShoppingList } from './shopping/useShoppingList';
import { ShoppingItem } from './types/shopping';

interface ShoppingListProps {
  userId: string;
  onSectionChange?: (section: string) => void;
}

export const ShoppingList = ({ userId, onSectionChange }: ShoppingListProps) => {
  const [newItem, setNewItem] = useState('');
  const { items, addItem, removeItem, toggleItem, loading } = useShoppingList(userId);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.trim()) {
      addItem(newItem.trim());
      setNewItem('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddItem(e);
    }
  };

  return (
    <div className="space-y-6">
      <BackToDashboard onBack={() => onSectionChange?.('overview')} />
      
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold">Liste de courses</h2>
            <p className="text-muted-foreground mt-2">
              Gérez votre liste de courses pour la semaine
            </p>
          </div>

          <form onSubmit={handleAddItem} className="flex gap-2">
            <Input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ajouter un article..."
              className="flex-1"
            />
            <Button type="submit" disabled={!newItem.trim() || loading}>
              Ajouter
            </Button>
          </form>

          <div className="space-y-2">
            {items.map((item: ShoppingItem) => (
              <div
                key={item.id}
                className="flex items-center space-x-2 p-2 rounded hover:bg-accent/10"
              >
                <Checkbox
                  id={item.id}
                  checked={item.completed}
                  onCheckedChange={() => toggleItem(item)}
                />
                <Label
                  htmlFor={item.id}
                  className={`flex-1 ${item.completed ? 'line-through text-muted-foreground' : ''}`}
                >
                  {item.name}
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(item.id)}
                  className="text-destructive hover:text-destructive/90"
                >
                  Supprimer
                </Button>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <StepNavigation
        previousStep={{
          label: "Retour au planning",
          route: "/dashboard/planner"
        }}
        nextStep={{
          label: "Valider le planning",
          route: "/dashboard/view-planner"
        }}
      />
    </div>
  );
};