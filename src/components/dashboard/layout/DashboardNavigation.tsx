import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from 'lucide-react';
import { 
  ChefHat, 
  Calendar, 
  User, 
  ShoppingCart, 
  Heart, 
  CalendarRange,
} from 'lucide-react';
import { useState } from 'react';

interface DashboardNavigationProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export const DashboardNavigation = ({ activeSection, setActiveSection }: DashboardNavigationProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const quickActions = [
    {
      label: 'Générer des recettes',
      icon: ChefHat,
      action: () => {
        setActiveSection('recipes');
        setIsOpen(false);
      }
    },
    {
      label: 'Planificateur de repas',
      icon: Calendar,
      action: () => {
        setActiveSection('planner');
        setIsOpen(false);
      }
    },
    {
      label: 'Voir le planning',
      icon: CalendarRange,
      action: () => {
        setActiveSection('view-planner');
        setIsOpen(false);
      }
    },
    {
      label: 'Profils enfants',
      icon: User,
      action: () => {
        setActiveSection('children');
        setIsOpen(false);
      }
    },
    {
      label: 'Liste de courses',
      icon: ShoppingCart,
      action: () => {
        setActiveSection('shopping');
        setIsOpen(false);
      }
    },
    {
      label: 'Mes favoris',
      icon: Heart,
      action: () => {
        setActiveSection('favorites');
        setIsOpen(false);
      }
    }
  ];

  const NavigationContent = () => (
    <div className="flex gap-2 overflow-x-auto">
      {quickActions.map((action, index) => (
        <Button
          key={index}
          variant={activeSection === action.label.toLowerCase() ? 'default' : 'outline'}
          onClick={action.action}
          className="whitespace-nowrap flex items-center gap-2"
        >
          <action.icon className="h-4 w-4" />
          <span>{action.label}</span>
        </Button>
      ))}
    </div>
  );

  return (
    <div className="mb-6">
      {/* Mobile Navigation */}
      <div className="md:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="lg" className="w-full flex items-center gap-2 justify-start">
              <Menu className="h-6 w-6" />
              <span>Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <nav className="flex flex-col gap-4 mt-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant={activeSection === action.label.toLowerCase() ? 'default' : 'outline'}
                  onClick={action.action}
                  className="w-full justify-start gap-2"
                >
                  <action.icon className="h-4 w-4" />
                  <span>{action.label}</span>
                </Button>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <NavigationContent />
      </div>
    </div>
  );
};