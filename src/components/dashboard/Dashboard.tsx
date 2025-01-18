import { useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ChildrenProfiles } from './ChildrenProfiles';
import { MealPlanner } from './MealPlanner';
import { ShoppingList } from './ShoppingList';
import { RecipeGenerator } from './RecipeGenerator';
import { StatsAndLeftovers } from './statistics/StatsAndLeftovers';
import { ChildProfile } from './types';
import { LeftoversManager } from './leftovers/LeftoversManager';
import { DashboardSidebar } from './DashboardSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

interface DashboardProps {
  session: Session;
}

export const Dashboard = ({ session }: DashboardProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(null);
  const [activeTab, setActiveTab] = useState('profiles');

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la déconnexion.",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profiles':
        return (
          <ChildrenProfiles 
            userId={session.user.id} 
            onSelectChild={setSelectedChild}
          />
        );
      case 'recipes':
        return <RecipeGenerator />;
      case 'planner':
        return <MealPlanner userId={session.user.id} />;
      case 'shopping':
        return <ShoppingList userId={session.user.id} />;
      case 'leftovers':
        return <LeftoversManager userId={session.user.id} />;
      case 'stats':
        return <StatsAndLeftovers />;
      default:
        return null;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <DashboardSidebar 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onSignOut={handleSignOut}
        />
        <main className="flex-1 p-6">
          <Card className="p-6">
            {renderContent()}
          </Card>
        </main>
      </div>
    </SidebarProvider>
  );
};