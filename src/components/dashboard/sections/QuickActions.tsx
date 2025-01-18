import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  ChefHat, 
  Calendar, 
  User, 
  ShoppingCart, 
  Heart, 
  CalendarRange,
  Menu
} from 'lucide-react';

interface QuickActionsProps {
  onSectionChange: (section: string) => void;
}

export const QuickActions = ({ onSectionChange }: QuickActionsProps) => {
  const menuGroups = [
    {
      label: 'Recettes',
      icon: ChefHat,
      items: [
        {
          label: 'Générer des recettes',
          onClick: () => onSectionChange('recipes'),
          icon: ChefHat
        },
        {
          label: 'Mes favoris',
          onClick: () => onSectionChange('recipes'),
          icon: Heart
        }
      ]
    },
    {
      label: 'Planning',
      icon: Calendar,
      items: [
        {
          label: 'Ajouter au planificateur',
          onClick: () => onSectionChange('planner'),
          icon: Calendar
        },
        {
          label: 'Voir le planning',
          onClick: () => onSectionChange('view-planner'),
          icon: CalendarRange
        }
      ]
    },
    {
      label: 'Gestion',
      icon: User,
      items: [
        {
          label: 'Profils enfants',
          onClick: () => onSectionChange('profiles'),
          icon: User
        },
        {
          label: 'Liste de courses',
          onClick: () => onSectionChange('shopping'),
          icon: ShoppingCart
        }
      ]
    }
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Actions rapides</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {menuGroups.map((group, index) => (
          <DropdownMenu key={index}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between"
              >
                <div className="flex items-center gap-2">
                  <group.icon className="w-5 h-5" />
                  <span>{group.label}</span>
                </div>
                <Menu className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {group.items.map((item, itemIndex) => (
                <DropdownMenuItem
                  key={itemIndex}
                  onClick={item.onClick}
                  className="cursor-pointer"
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ))}
      </div>
    </Card>
  );
};