import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar, ChefHat, User, ShoppingCart, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'Planifier un repas',
      icon: Calendar,
      onClick: () => navigate('/dashboard?tab=planner')
    },
    {
      label: 'Générer des recettes',
      icon: ChefHat,
      onClick: () => navigate('/dashboard?tab=recipes')
    },
    {
      label: 'Ajouter un profil enfant',
      icon: User,
      onClick: () => navigate('/dashboard?tab=profiles')
    },
    {
      label: 'Liste de courses',
      icon: ShoppingCart,
      onClick: () => navigate('/dashboard?tab=shopping')
    },
    {
      label: 'Mes favoris',
      icon: Heart,
      onClick: () => navigate('/dashboard?tab=recipes')
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