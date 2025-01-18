import { Session } from '@supabase/auth-helpers-react';
import { ChildProfile } from '../types';
import { WelcomeSection } from '../sections/WelcomeSection';
import { QuickActions } from '../sections/QuickActions';
import { WeeklyProgress } from '../sections/WeeklyProgress';
import { StatsAndLeftovers } from '../statistics/StatsAndLeftovers';
import { WeeklyPlanViewer } from '../WeeklyPlanViewer';
import { ChildrenProfiles } from '../ChildrenProfiles';
import { RecipeGenerator } from '../RecipeGenerator';
import { MealPlanner } from '../MealPlanner';

interface DashboardContentProps {
  session: Session;
  activeSection: string;
  selectedChild: ChildProfile | null;
  setSelectedChild: (child: ChildProfile | null) => void;
}

export const DashboardContent = ({
  session,
  activeSection,
  selectedChild,
  setSelectedChild,
}: DashboardContentProps) => {
  const handleSectionChange = (section: string) => {
    // Cette fonction sera passée aux composants enfants
  };

  if (activeSection === 'overview') {
    return (
      <div className="space-y-6">
        <WelcomeSection userId={session.user.id} />
        <QuickActions onSectionChange={handleSectionChange} />
        <WeeklyProgress 
          plannedMeals={0} 
          totalMeals={21} 
          newRecipes={0} 
        />
        <StatsAndLeftovers />
        <WeeklyPlanViewer 
          userId={session.user.id} 
          onSectionChange={handleSectionChange} 
        />
      </div>
    );
  }

  if (activeSection === 'children') {
    return (
      <ChildrenProfiles 
        userId={session.user.id} 
        onSelectChild={setSelectedChild} 
      />
    );
  }

  if (activeSection === 'recipes') {
    return (
      <RecipeGenerator 
        onSectionChange={() => setActiveSection('overview')} 
      />
    );
  }

  if (activeSection === 'planner') {
    return (
      <MealPlanner 
        userId={session.user.id} 
        onSectionChange={handleSectionChange} 
      />
    );
  }

  return null;
};