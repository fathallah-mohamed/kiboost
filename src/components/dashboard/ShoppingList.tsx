import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ShoppingCart, Download, Store, ChefHat } from 'lucide-react';
import { BackToDashboard } from './BackToDashboard';

interface ShoppingListProps {
  userId: string;
  onSectionChange?: (section: string) => void;
}

interface ShoppingItem {
  name: string;
  quantity: number;
  unit: string;
}

export const ShoppingList = ({ userId, onSectionChange }: ShoppingListProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ShoppingItem[]>([
    { name: "Lait", quantity: 1, unit: "L" },
    { name: "Œufs", quantity: 6, unit: "pièces" },
    { name: "Pain", quantity: 1, unit: "pièce" },
    // Exemple d'items, à remplacer par les vrais données de la BD
  ]);

  const handleDownload = () => {
    const content = items
      .map(item => `${item.name}: ${item.quantity} ${item.unit}`)
      .join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'liste-courses.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Liste téléchargée",
      description: "Votre liste de courses a été téléchargée avec succès.",
    });
  };

  const handleOrderOnline = () => {
    toast({
      title: "Fonctionnalité en développement",
      description: "La commande en ligne sera bientôt disponible !",
    });
  };

  const goToRecipes = () => {
    onSectionChange?.('recipes');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <BackToDashboard onBack={() => onSectionChange?.('overview')} />
        <Button onClick={goToRecipes} variant="outline">
          <ChefHat className="w-4 h-4 mr-2" />
          Voir les recettes
        </Button>
      </div>

      <h2 className="text-2xl font-bold">Liste de courses</h2>
      
      <Card className="p-6">
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
              <span>{item.name}</span>
              <span className="text-muted-foreground">
                {item.quantity} {item.unit}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex gap-4 justify-end">
        <Button onClick={handleDownload} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Télécharger la liste
        </Button>
        <Button onClick={handleOrderOnline}>
          <Store className="w-4 h-4 mr-2" />
          Commander en ligne
        </Button>
      </div>
    </div>
  );
};