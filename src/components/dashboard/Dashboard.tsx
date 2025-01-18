import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ChildrenProfiles } from './ChildrenProfiles';
import { MealPlanner } from './MealPlanner';
import { ShoppingList } from './ShoppingList';
import { RecipeGenerator } from './RecipeGenerator';
import { StatsAndLeftovers } from './statistics/StatsAndLeftovers';
import { ChildProfile } from './types';
import { LeftoversManager } from './leftovers/LeftoversManager';
import { Sidebar } from '../layout/Sidebar';

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
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profiles':
        return (
          <Card className="p-6">
            <ChildrenProfiles 
              userId={session.user.id} 
              onSelectChild={setSelectedChild}
            />
          </Card>
        );
      case 'recipes':
        return (
          <Card className="p-6">
            <RecipeGenerator />
          </Card>
        );
      case 'planner':
        return (
          <Card className="p-6">
            <MealPlanner userId={session.user.id} />
          </Card>
        );
      case 'shopping':
        return (
          <Card className="p-6">
            <ShoppingList userId={session.user.id} />
          </Card>
        );
      case 'leftovers':
        return (
          <Card className="p-6">
            <LeftoversManager userId={session.user.id} />
          </Card>
        );
      case 'stats':
        return (
          <Card className="p-6">
            <StatsAndLeftovers />
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Tableau de bord</h1>
            <Button onClick={handleSignOut} variant="outline" disabled={loading}>
              {loading ? 'Déconnexion...' : 'Se déconnecter'}
            </Button>
          </div>
          <div className="animate-fade-in">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};