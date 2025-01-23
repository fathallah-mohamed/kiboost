import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProgressSteps } from "./ProgressSteps";
import { PriorityTasks } from "./PriorityTasks";
import { WeeklyOverview } from "./WeeklyOverview";

interface WelcomeSectionProps {
  userId: string;
}

export const WelcomeSection = ({ userId }: WelcomeSectionProps) => {
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    const fetchUsername = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUsername(user.email.split("@")[0]);
      }
    };
    fetchUsername();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-accent/10">
        <h2 className="text-2xl font-bold">
          Bonjour {username} 👋
        </h2>
        <p className="text-muted-foreground mt-2">
          Bienvenue sur votre tableau de bord Kiboost. Commençons à planifier des repas sains pour vos enfants !
        </p>
      </Card>

      <ProgressSteps />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PriorityTasks />
        <WeeklyOverview />
      </div>
    </div>
  );
};