import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NutritionalStats } from "./NutritionalStats";
import { MealFrequency } from "./MealFrequency";
import { LeftoversManager } from "../leftovers/LeftoversManager";
import { useAuth } from "@supabase/auth-helpers-react";

export const StatsAndLeftovers = () => {
  const user = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Statistiques et Gestion des Restes</h2>
      
      <Tabs defaultValue="nutrition" className="space-y-4">
        <TabsList>
          <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
          <TabsTrigger value="frequency">Fréquence</TabsTrigger>
          <TabsTrigger value="leftovers">Restes</TabsTrigger>
        </TabsList>

        <TabsContent value="nutrition">
          <NutritionalStats />
        </TabsContent>

        <TabsContent value="frequency">
          <MealFrequency />
        </TabsContent>

        <TabsContent value="leftovers">
          <LeftoversManager userId={user.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};