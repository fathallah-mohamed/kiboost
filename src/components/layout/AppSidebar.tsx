import { useState } from 'react';
import { 
  BookOpen, 
  Calendar, 
  ShoppingCart, 
  Users, 
  LogOut,
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface NavItem {
  icon: React.ElementType;
  label: string;
  value: string;
}

const navItems: NavItem[] = [
  { icon: BookOpen, label: 'Recettes', value: 'recipes' },
  { icon: Calendar, label: 'Planificateur', value: 'planner' },
  { icon: ShoppingCart, label: 'Liste de courses', value: 'shopping' },
  { icon: Users, label: 'Profils enfants', value: 'profiles' },
];

interface AppSidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onSignOut: () => void;
}

export const AppSidebar = ({ currentTab, onTabChange, onSignOut }: AppSidebarProps) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="space-y-2 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.value}
              variant={currentTab === item.value ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-2",
                currentTab === item.value && "bg-accent text-accent-foreground"
              )}
              onClick={() => {
                onTabChange(item.value);
                setIsMobileOpen(false);
              }}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </div>
      <Button
        variant="ghost"
        className="w-full justify-start gap-2 mt-auto"
        onClick={onSignOut}
      >
        <LogOut className="h-4 w-4" />
        Se déconnecter
      </Button>
    </div>
  );

  return (
    <>
      {/* Version mobile */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64">
          <NavContent />
        </SheetContent>
      </Sheet>

      {/* Version desktop */}
      <div className="hidden md:flex flex-col w-64 p-4 border-r min-h-screen">
        <NavContent />
      </div>
    </>
  );
};