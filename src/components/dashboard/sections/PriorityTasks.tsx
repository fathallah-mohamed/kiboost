import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const PriorityTasks = () => {
  const navigate = useNavigate();
  
  const tasks = [
    {
      id: "plan-meals",
      message: "Vous n'avez pas encore planifié vos repas pour cette semaine",
      action: "Planifier maintenant",
      route: "planner"
    },
    {
      id: "shopping-list",
      message: "Votre liste de courses n'est pas à jour",
      action: "Mettre à jour",
      route: "shopping"
    }
  ];

  return (
    <Card className="p-6 space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-orange-500" />
        Tâches prioritaires
      </h3>

      <div className="space-y-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between p-4 bg-orange-50 rounded-lg animate-fade-in"
          >
            <p className="text-sm text-orange-800">{task.message}</p>
            <Button
              variant="default"
              onClick={() => navigate(task.route)}
              className="whitespace-nowrap ml-4"
            >
              {task.action}
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
};