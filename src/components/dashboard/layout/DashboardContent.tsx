import { useEffect, useState } from 'react';
import { WelcomeSection } from '../sections/WelcomeSection';
import { QuickActions } from '../sections/QuickActions';
import { WeeklyProgress } from '../sections/WeeklyProgress';
import { StatsAndLeftovers } from '../statistics/StatsAndLeftovers';
import { RecipeGenerator } from '../RecipeGenerator';
import { MealPlanner } from '../MealPlanner';
import { WeeklyPlanViewer } from '../WeeklyPlanViewer';
import { ChildrenProfiles } from '../ChildrenProfiles';
import { ShoppingList } from '../ShoppingList';
import { DashboardNavigation } from './DashboardNavigation';
import { FavoriteRecipes } from '../favorites/FavoriteRecipes';

interface DashboardContentProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export const DashboardContent = ({ activeSection, setActiveSection }: DashboardContentProps) => {
  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <WelcomeSection />
            <DashboardNavigation 
              activeSection={activeSection} 
              setActiveSection={setActiveSection}
            />
            <QuickActions onSectionChange={setActiveSection} />
            <WeeklyProgress />
            <StatsAndLeftovers />
          </div>
        );
      case 'recipes':
        return <RecipeGenerator onSectionChange={setActiveSection} />;
      case 'planner':
        return <MealPlanner onSectionChange={setActiveSection} />;
      case 'view-planner':
        return <WeeklyPlanViewer onSectionChange={setActiveSection} />;
      case 'children':
        return <ChildrenProfiles onSectionChange={setActiveSection} />;
      case 'shopping':
        return <ShoppingList onSectionChange={setActiveSection} />;
      case 'favorites':
        return <FavoriteRecipes onSectionChange={setActiveSection} />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {renderContent()}
    </div>
  );
};