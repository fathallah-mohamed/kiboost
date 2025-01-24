import { Session } from '@supabase/auth-helpers-react';
import { WelcomeSection } from '../sections/WelcomeSection';
import { RecipeGenerator } from '../RecipeGenerator';
import { MealPlanner } from '../MealPlanner';
import { WeeklyPlanViewer } from '../WeeklyPlanViewer';
import { ChildrenProfiles } from '../ChildrenProfiles';
import { ShoppingList } from '../ShoppingList';
import { FavoriteRecipes } from '../favorites/FavoriteRecipes';
import { CategoriesGrid } from '../categories/CategoriesGrid';

interface DashboardContentProps {
  session: Session;
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export const DashboardContent = ({ 
  session, 
  activeSection, 
  setActiveSection 
}: DashboardContentProps) => {
  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <WelcomeSection 
            userId={session.user.id} 
            onSectionChange={setActiveSection}
          />
        );
      case 'categories':
        return <CategoriesGrid />;
      case 'recipes':
        return <RecipeGenerator />;
      case 'planner':
        return <MealPlanner userId={session.user.id} />;
      case 'view-planner':
        return <WeeklyPlanViewer userId={session.user.id} />;
      case 'children':
        return <ChildrenProfiles userId={session.user.id} onSelectChild={() => {}} />;
      case 'shopping':
        return <ShoppingList userId={session.user.id} />;
      case 'favorites':
        return <FavoriteRecipes />;
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