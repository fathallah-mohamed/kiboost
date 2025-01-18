import { useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  BookOpen, 
  Calendar, 
  ShoppingCart, 
  Package, 
  BarChart2, 
  LogOut 
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DashboardSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSignOut: () => Promise<void>;
}

export const DashboardSidebar = ({ activeTab, onTabChange, onSignOut }: DashboardSidebarProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const menuItems = [
    { id: 'profiles', label: 'Profils enfants', icon: Users },
    { id: 'recipes', label: 'Recettes', icon: BookOpen },
    { id: 'planner', label: 'Planificateur', icon: Calendar },
    { id: 'shopping', label: 'Liste de courses', icon: ShoppingCart },
    { id: 'leftovers', label: 'Restes', icon: Package },
    { id: 'stats', label: 'Statistiques', icon: BarChart2 },
  ];

  const handleSignOut = async () => {
    try {
      await onSignOut();
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt sur Kiboost !",
      });
      navigate('/');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la déconnexion.",
      });
    }
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onTabChange(item.id)}
                    data-active={activeTab === item.id}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-accent rounded-md transition-colors"
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <Button 
          variant="outline" 
          className="w-full flex items-center gap-2"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4" />
          Se déconnecter
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};