import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { AvailableIngredient } from '../types';

interface AvailableIngredientFormProps {
  onAdd: (ingredient: AvailableIngredient) => void;
}

export const AvailableIngredientForm = ({ onAdd }: AvailableIngredientFormProps) => {
  const [newIngredient, setNewIngredient] = useState<AvailableIngredient>({
    ingredient_name: '',
    quantity: 0,
    unit: 'g'
  });

  return (
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
        <Button 
          onClick={() => {
            onAdd(newIngredient);
            setNewIngredient({
              ingredient_name: '',
              quantity: 0,
              unit: 'g'
            });
          }} 
          className="w-full gap-2"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </Button>
      </div>
    </div>
  );
};