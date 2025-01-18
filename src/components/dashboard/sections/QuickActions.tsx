import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar, ChefHat, User, ShoppingCart, Heart } from 'lucide-react';

interface QuickActionsProps {
  onSectionChange: (section: string) => void;
}

export const QuickActions = ({ onSectionChange }: QuickActionsProps) => {
  const actions = [
    {
      label: 'Générer des recettes',
      icon: ChefHat,
      onClick: () => onSectionChange('recipes')
    },
    {
      label: 'Planifier un repas',
      icon: Calendar,
      onClick: () => onSectionChange('planner')
    },
    {
      label: 'Profils enfants',
      icon: User,
      onClick: () => onSectionChange('profiles')
    },
    {
      label: 'Liste de courses',
      icon: ShoppingCart,
      onClick: () => onSectionChange('shopping')
    },
    {
      label: 'Mes favoris',
      icon: Heart,
      onClick: () => onSectionChange('recipes')
    }
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Actions rapides</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            className="flex flex-col gap-2 h-auto py-4"
            onClick={action.onClick}
          >
            <action.icon className="w-5 h-5" />
            <span className="text-sm text-center">{action.label}</span>
          </Button>
        ))}
      </div>
    </Card>
  );
};