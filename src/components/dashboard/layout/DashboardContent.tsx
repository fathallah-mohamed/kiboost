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
  if (activeSection === 'overview') {
    return (
      <div className="space-y-6">
        <WelcomeSection />
        <QuickActions />
        <WeeklyProgress />
        <StatsAndLeftovers />
        <WeeklyPlanViewer />
      </div>
    );
  }

  if (activeSection === 'children') {
    return <ChildrenProfiles session={session} />;
  }

  if (activeSection === 'recipes') {
    return <RecipeGenerator session={session} />;
  }

  if (activeSection === 'planner') {
    return <MealPlanner session={session} />;
  }

  return null;
};