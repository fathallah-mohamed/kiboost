import { Button } from '@/components/ui/button';
import { 
  ChefHat, 
  Calendar, 
  User, 
  ShoppingCart, 
  Heart, 
  CalendarRange,
} from 'lucide-react';

interface DashboardNavigationProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export const DashboardNavigation = ({ activeSection, setActiveSection }: DashboardNavigationProps) => {
  const quickActions = [
    {
      label: 'Générer des recettes',
      icon: ChefHat,
      action: () => setActiveSection('recipes')
    },
    {
      label: 'Planificateur de repas',
      icon: Calendar,
      action: () => setActiveSection('planner')
    },
    {
      label: 'Voir le planning',
      icon: CalendarRange,
      action: () => setActiveSection('view-planner')
    },
    {
      label: 'Profils enfants',
      icon: User,
      action: () => setActiveSection('children')
    },
    {
      label: 'Liste de courses',
      icon: ShoppingCart,
      action: () => setActiveSection('shopping')
    },
    {
      label: 'Mes favoris',
      icon: Heart,
      action: () => setActiveSection('recipes')
    }
  ];

  return (
    <div className="flex gap-2 mb-6 overflow-x-auto">
      {quickActions.map((action, index) => (
        <Button
          key={index}
          variant="outline"
          onClick={action.action}
          className="whitespace-nowrap"
        >
          <action.icon className="h-4 w-4" />
          <span>{action.label}</span>
        </Button>
      ))}
    </div>
  );
};