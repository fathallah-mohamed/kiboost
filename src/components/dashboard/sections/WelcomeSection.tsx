import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProgressSteps } from "./ProgressSteps";
import { PriorityTasks } from "./PriorityTasks";
import { WeeklyOverview } from "./WeeklyOverview";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap } from "lucide-react";
import { useQuickPlan } from "../meal-planner/hooks/useQuickPlan";

interface WelcomeSectionProps {
  userId: string;
  onSectionChange: (section: string) => void;
}

export const WelcomeSection = ({ userId, onSectionChange }: WelcomeSectionProps) => {
  const [username, setUsername] = useState<string>("");
  const { generateQuickPlan, loading } = useQuickPlan(userId);

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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">
              Bonjour {username} 👋
            </h2>
            <p className="text-muted-foreground mt-2">
              Bienvenue sur votre tableau de bord Kiboost. Commençons à planifier des repas sains pour vos enfants !
            </p>
          </div>
          <Button 
            onClick={generateQuickPlan}
            disabled={loading}
            className="whitespace-nowrap group hover:scale-105 transition-all duration-300"
          >
            {loading ? (
              <Sparkles className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 mr-2 group-hover:text-yellow-400" />
            )}
            Planning express
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        <ProgressSteps onSectionChange={onSectionChange} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PriorityTasks />
          <WeeklyOverview />
        </div>
      </div>
    </div>
  );
};