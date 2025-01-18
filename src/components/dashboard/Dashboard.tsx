import { Session } from '@supabase/supabase-js';
import { Card } from '@/components/ui/card';
import { ChildrenProfiles } from './ChildrenProfiles';
import { MealPlanner } from './MealPlanner';
import { ShoppingList } from './ShoppingList';
import { RecipeGenerator } from './RecipeGenerator';
import { StatsAndLeftovers } from './statistics/StatsAndLeftovers';
import { LeftoversManager } from './leftovers/LeftoversManager';
import { DashboardLayout } from './DashboardLayout';

interface DashboardProps {
  session: Session;
}

export const Dashboard = ({ session }: DashboardProps) => {
  return (
    <DashboardLayout session={session}>
      <div className="space-y-6">
        <Card className="p-6">
          <ChildrenProfiles 
            userId={session.user.id} 
          />
        </Card>

        <Card className="p-6">
          <RecipeGenerator />
        </Card>

        <Card className="p-6">
          <MealPlanner userId={session.user.id} />
        </Card>

        <Card className="p-6">
          <ShoppingList userId={session.user.id} />
        </Card>

        <Card className="p-6">
          <LeftoversManager userId={session.user.id} />
        </Card>

        <Card className="p-6">
          <StatsAndLeftovers />
        </Card>
      </div>
    </DashboardLayout>
  );
};