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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DashboardProps {
  session: Session;
}

export const Dashboard = ({ session }: DashboardProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);

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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <Button onClick={handleSignOut} variant="outline" disabled={loading}>
          {loading ? 'Déconnexion...' : 'Se déconnecter'}
        </Button>
      </div>

      <Tabs defaultValue="profiles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profiles">Profils enfants</TabsTrigger>
          <TabsTrigger value="recipes">Recettes</TabsTrigger>
          <TabsTrigger value="planner">Planificateur</TabsTrigger>
          <TabsTrigger value="shopping">Liste de courses</TabsTrigger>
        </TabsList>

        <TabsContent value="profiles">
          <Card className="p-6">
            <ChildrenProfiles 
              userId={session.user.id} 
              onSelectChild={setSelectedChild}
            />
          </Card>
        </TabsContent>

        <TabsContent value="recipes">
          <Card className="p-6">
            <RecipeGenerator selectedChild={selectedChild} />
          </Card>
        </TabsContent>

        <TabsContent value="planner">
          <Card className="p-6">
            <MealPlanner userId={session.user.id} />
          </Card>
        </TabsContent>

        <TabsContent value="shopping">
          <Card className="p-6">
            <ShoppingList userId={session.user.id} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};