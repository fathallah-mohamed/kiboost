import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { WelcomeSection } from './sections/WelcomeSection';
import { QuickActions } from './sections/QuickActions';
import { WeeklyProgress } from './sections/WeeklyProgress';
import { PremiumTeaser } from './sections/PremiumTeaser';
import { ChildrenProfiles } from './ChildrenProfiles';
import { MealPlanner } from './MealPlanner';
import { ShoppingList } from './ShoppingList';
import { RecipeGenerator } from './RecipeGenerator';
import { StatsAndLeftovers } from './statistics/StatsAndLeftovers';
import { WeeklyPlanViewer } from './WeeklyPlanViewer';
import { ChildProfile } from './types';
import { Link, useNavigate } from 'react-router-dom';
import { HomeIcon } from 'lucide-react';

interface DashboardProps {
  session: Session;
}

export const Dashboard = ({ session }: DashboardProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(null);
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [weeklyStats, setWeeklyStats] = useState({
    plannedMeals: 0,
    totalMeals: 5,
    newRecipes: 0
  });

  useEffect(() => {
    const fetchWeeklyStats = async () => {
      const startOfWeek = new Date();
      startOfWeek.setHours(0, 0, 0, 0);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);

      const { data: mealPlans } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('profile_id', session.user.id)
        .gte('date', startOfWeek.toISOString())
        .lte('date', endOfWeek.toISOString());

      const { data: newRecipes } = await supabase
        .from('recipes')
        .select('*')
        .eq('profile_id', session.user.id)
        .gte('created_at', startOfWeek.toISOString());

      setWeeklyStats({
        plannedMeals: mealPlans?.length || 0,
        totalMeals: 5,
        newRecipes: newRecipes?.length || 0
      });
    };

    fetchWeeklyStats();
  }, [session.user.id]);

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
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
    } finally {
      setLoading(false);
    }
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'profiles':
        return <ChildrenProfiles userId={session.user.id} onSelectChild={setSelectedChild} />;
      case 'recipes':
        return <RecipeGenerator onSectionChange={setActiveSection} />;
      case 'planner':
        return <MealPlanner userId={session.user.id} onSectionChange={setActiveSection} />;
      case 'view-planner':
        return <WeeklyPlanViewer userId={session.user.id} onSectionChange={setActiveSection} />;
      case 'shopping':
        return <ShoppingList userId={session.user.id} onSectionChange={setActiveSection} />;
      case 'stats':
        return <StatsAndLeftovers onSectionChange={setActiveSection} />;
      default:
        return (
          <div className="space-y-6">
            <WelcomeSection userId={session.user.id} />
            <QuickActions onSectionChange={setActiveSection} />
            <WeeklyProgress {...weeklyStats} />
            <PremiumTeaser />
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link to="/"><HomeIcon className="mr-2" />Retour à l'accueil</Link>
          </Button>
          <h1 className="text-3xl font-bold">Tableau de bord</h1>
        </div>
        <Button onClick={handleSignOut} variant="outline" disabled={loading}>
          {loading ? 'Déconnexion...' : 'Se déconnecter'}
        </Button>
      </div>

      {renderActiveSection()}
    </div>
  );
};