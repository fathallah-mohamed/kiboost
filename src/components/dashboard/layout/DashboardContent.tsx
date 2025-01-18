import { useState } from 'react';
import { Session } from '@supabase/auth-helpers-react';
import { WelcomeSection } from '../sections/WelcomeSection';
import { QuickActions } from '../sections/QuickActions';
import { WeeklyProgress } from '../sections/WeeklyProgress';
import { StatsAndLeftovers } from '../statistics/StatsAndLeftovers';
import { RecipeGenerator } from '../RecipeGenerator';
import { MealPlanner } from '../MealPlanner';
import { WeeklyPlanViewer } from '../WeeklyPlanViewer';
import { ChildrenProfiles } from '../ChildrenProfiles';
import { ShoppingList } from '../ShoppingList';
import { FavoriteRecipes } from '../favorites/FavoriteRecipes';

interface DashboardContentProps {
  session: Session;
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export const DashboardContent = ({ session, activeSection, setActiveSection }: DashboardContentProps) => {
  const [plannedMeals, setPlannedMeals] = useState(0);
  const [totalMeals, setTotalMeals] = useState(21); // 3 meals per day for 7 days
  const [newRecipes, setNewRecipes] = useState(0);

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <WelcomeSection userId={session.user.id} />
            <QuickActions onSectionChange={setActiveSection} />
            <WeeklyProgress 
              plannedMeals={plannedMeals}
              totalMeals={totalMeals}
              newRecipes={newRecipes}
            />
            <StatsAndLeftovers />
          </div>
        );
      case 'recipes':
        return <RecipeGenerator onSectionChange={setActiveSection} />;
      case 'planner':
        return <MealPlanner userId={session.user.id} onSectionChange={setActiveSection} />;
      case 'view-planner':
        return <WeeklyPlanViewer userId={session.user.id} onSectionChange={setActiveSection} />;
      case 'children':
        return <ChildrenProfiles userId={session.user.id} onSelectChild={() => {}} />;
      case 'shopping':
        return <ShoppingList userId={session.user.id} onSectionChange={setActiveSection} />;
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