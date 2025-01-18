import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Users,
  BookOpen,
  Calendar,
  ShoppingCart,
  Refrigerator,
  BarChart,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SidebarProps {
  currentSection: string;
}

export const Sidebar = ({ currentSection }: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt sur Kiboost !",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la déconnexion.",
      });
    }
  };

  const navigationItems = [
    { label: 'Profils enfants', icon: Users, value: 'profiles' },
    { label: 'Recettes', icon: BookOpen, value: 'recipes' },
    { label: 'Planificateur', icon: Calendar, value: 'planner' },
    { label: 'Liste de courses', icon: ShoppingCart, value: 'shopping' },
    { label: 'Restes', icon: Refrigerator, value: 'leftovers' },
    { label: 'Statistiques', icon: BarChart, value: 'stats' },
  ];

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      <div className={cn(
        "fixed left-0 top-0 h-full bg-background border-r transition-all duration-300 z-40",
        isOpen ? "w-64" : "w-0 lg:w-20",
        "lg:relative lg:block"
      )}>
        <div className="flex flex-col h-full p-4">
          <div className="space-y-4 flex-1">
            {navigationItems.map((item) => (
              <Button
                key={item.value}
                variant={currentSection === item.value ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-2 transition-all",
                  !isOpen && "lg:justify-center"
                )}
                asChild
              >
                <Link to={`#${item.value}`}>
                  <item.icon className="h-5 w-5" />
                  <span className={cn(
                    "transition-all",
                    !isOpen && "lg:hidden"
                  )}>
                    {item.label}
                  </span>
                </Link>
              </Button>
            ))}
          </div>

          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-2 text-destructive hover:text-destructive",
              !isOpen && "lg:justify-center"
            )}
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5" />
            <span className={cn(
              "transition-all",
              !isOpen && "lg:hidden"
            )}>
              Déconnexion
            </span>
          </Button>
        </div>
      </div>
    </>
  );
};