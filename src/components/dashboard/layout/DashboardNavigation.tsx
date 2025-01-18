import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  ChefHat, 
  Calendar, 
  User, 
  ShoppingCart, 
  Heart, 
  CalendarRange,
  Menu
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
      label: 'Ajouter au planificateur',
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
    <div className="flex gap-2 mb-6">
      <Button
        variant={activeSection === 'overview' ? 'default' : 'outline'}
        onClick={() => setActiveSection('overview')}
      >
        Vue d'ensemble
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Menu className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {quickActions.map((action, index) => (
            <DropdownMenuItem
              key={index}
              onClick={action.action}
              className="flex items-center gap-2 cursor-pointer"
            >
              <action.icon className="h-4 w-4" />
              <span>{action.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant={activeSection === 'children' ? 'default' : 'outline'}
        onClick={() => setActiveSection('children')}
      >
        Profils enfants
      </Button>
      <Button
        variant={activeSection === 'recipes' ? 'default' : 'outline'}
        onClick={() => setActiveSection('recipes')}
      >
        Recettes
      </Button>
      <Button
        variant={activeSection === 'planner' ? 'default' : 'outline'}
        onClick={() => setActiveSection('planner')}
      >
        Planificateur
      </Button>
    </div>
  );
};