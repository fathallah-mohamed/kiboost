import { useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { Card } from '@/components/ui/card';
import { ChildrenProfiles } from './ChildrenProfiles';
import { MealPlanner } from './MealPlanner';
import { ShoppingList } from './ShoppingList';
import { RecipeGenerator } from './RecipeGenerator';
import { StatsAndLeftovers } from './statistics/StatsAndLeftovers';
import { LeftoversManager } from './leftovers/LeftoversManager';
import { Sidebar } from './navigation/Sidebar';
import { DashboardOverview } from './overview/DashboardOverview';
import { ChildProfile } from './types';

interface DashboardProps {
  session: Session;
}

export const Dashboard = ({ session }: DashboardProps) => {
  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(null);
  const [currentSection, setCurrentSection] = useState('overview');

  // Écouter les changements de hash dans l'URL
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    setCurrentSection(hash || 'overview');
  });

  const renderContent = () => {
    switch (currentSection) {
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
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar currentSection={currentSection} />
      <div className="flex-1 p-4 lg:p-6 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
};