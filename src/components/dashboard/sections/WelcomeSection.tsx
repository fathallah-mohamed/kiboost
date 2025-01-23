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
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold">
          Bonjour {username} 👋
        </h2>
        <p className="text-muted-foreground mt-2">
          Bienvenue sur votre tableau de bord Kiboost
        </p>
      </Card>

      <ProgressSteps />
      <PriorityTasks />
      <WeeklyOverview />
    </div>
  );
};