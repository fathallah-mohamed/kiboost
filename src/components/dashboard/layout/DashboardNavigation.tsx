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
  Grid,
  Home
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface DashboardNavigationProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export const DashboardNavigation = ({ 
  activeSection, 
  setActiveSection 
}: DashboardNavigationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const quickActions = [
    {
      label: 'Accueil',
      icon: Home,
      path: '/dashboard/overview'
    },
    {
      label: 'Catégories',
      icon: Grid,
      path: '/dashboard/categories'
    },
    {
      label: 'Recettes',
      icon: ChefHat,
      path: '/dashboard/recipes'
    },
    {
      label: 'Planificateur',
      icon: Calendar,
      path: '/dashboard/planner'
    },
    {
      label: 'Voir le planning',
      icon: CalendarRange,
      path: '/dashboard/view-planner'
    },
    {
      label: 'Profils enfants',
      icon: User,
      path: '/dashboard/children'
    },
    {
      label: 'Liste de courses',
      icon: ShoppingCart,
      path: '/dashboard/shopping'
    },
    {
      label: 'Mes favoris',
      icon: Heart,
      path: '/dashboard/favorites'
    }
  ];

  const handleNavigation = (path: string, label: string) => {
    navigate(path);
    setActiveSection(label.toLowerCase());
    setIsOpen(false);
  };

  const NavigationContent = () => (
    <div className="flex gap-2 overflow-x-auto pb-4">
      {quickActions.map((action, index) => (
        <Button
          key={index}
          onClick={() => handleNavigation(action.path, action.label)}
          className={`whitespace-nowrap group hover:scale-105 transition-all duration-300 ${
            activeSection === action.label.toLowerCase()
            ? 'bg-gradient-to-r from-primary to-accent text-white'
            : 'bg-gradient-to-r from-secondary/50 to-accent/50 hover:from-primary/80 hover:to-accent/80'
          }`}
        >
          <action.icon className="w-4 h-4 mr-2 group-hover:text-white transition-colors" />
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
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full flex items-center gap-2 justify-start hover:scale-105 transition-all duration-300"
            >
              <Menu className="h-6 w-6" />
              <span>Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <nav className="flex flex-col gap-4 mt-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  onClick={() => handleNavigation(action.path, action.label)}
                  className={`w-full justify-start gap-2 group hover:scale-105 transition-all duration-300 ${
                    activeSection === action.label.toLowerCase()
                    ? 'bg-gradient-to-r from-primary to-accent text-white'
                    : 'bg-gradient-to-r from-secondary/50 to-accent/50 hover:from-primary/80 hover:to-accent/80'
                  }`}
                >
                  <action.icon className="h-4 w-4 group-hover:text-white transition-colors" />
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