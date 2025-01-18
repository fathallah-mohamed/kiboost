import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WelcomeSection } from './sections/WelcomeSection';
import { QuickActions } from './sections/QuickActions';
import { WeeklyProgress } from './sections/WeeklyProgress';
import { PremiumTeaser } from './sections/PremiumTeaser';
import { ChildrenProfiles } from './ChildrenProfiles';
import { MealPlanner } from './MealPlanner';
import { ShoppingList } from './ShoppingList';
import { RecipeGenerator } from './RecipeGenerator';
import { StatsAndLeftovers } from './statistics/StatsAndLeftovers';
import { ChildProfile } from './types';

interface DashboardProps {
  session: Session;
}

export const Dashboard = ({ session }: DashboardProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(null);
  const [weeklyStats, setWeeklyStats] = useState({
    plannedMeals: 0,
    totalMeals: 5,
    newRecipes: 0
  });

  useEffect(() => {
    const fetchWeeklyStats = async () => {
      // Fetch planned meals for the current week
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

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <Button onClick={handleSignOut} variant="outline" disabled={loading}>
          {loading ? 'Déconnexion...' : 'Se déconnecter'}
        </Button>
      </div>

      <div className="grid gap-6">
        <WelcomeSection userId={session.user.id} />
        <QuickActions />
        <WeeklyProgress {...weeklyStats} />
      </div>

      <Tabs defaultValue="profiles" className="space-y-4">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="profiles">Profils enfants</TabsTrigger>
          <TabsTrigger value="recipes">Recettes</TabsTrigger>
          <TabsTrigger value="planner">Planificateur</TabsTrigger>
          <TabsTrigger value="shopping">Liste de courses</TabsTrigger>
          <TabsTrigger value="stats">Statistiques</TabsTrigger>
        </TabsList>

        <TabsContent value="profiles">
          <ChildrenProfiles 
            userId={session.user.id} 
            onSelectChild={setSelectedChild}
          />
        </TabsContent>

        <TabsContent value="recipes">
          <RecipeGenerator />
        </TabsContent>

        <TabsContent value="planner">
          <MealPlanner userId={session.user.id} />
        </TabsContent>

        <TabsContent value="shopping">
          <ShoppingList userId={session.user.id} />
        </TabsContent>

        <TabsContent value="stats">
          <StatsAndLeftovers />
        </TabsContent>
      </Tabs>

      <PremiumTeaser />
    </div>
  );
};