import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const PriorityTasks = () => {
  const navigate = useNavigate();
  
  const tasks = [
    {
      id: "plan-meals",
      message: "Vous n'avez pas encore planifié vos repas pour cette semaine",
      action: "Planifier maintenant",
      route: "planner",
      priority: "high"
    },
    {
      id: "shopping-list",
      message: "Votre liste de courses n'est pas à jour",
      action: "Mettre à jour",
      route: "shopping",
      priority: "medium"
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-50 text-red-800 border-red-100";
      case "medium":
        return "bg-orange-50 text-orange-800 border-orange-100";
      default:
        return "bg-yellow-50 text-yellow-800 border-yellow-100";
    }
  };

  const handleTaskClick = (task: typeof tasks[0]) => {
    toast.success(`Redirection vers ${task.action.toLowerCase()}...`);
    navigate(task.route);
  };

  return (
    <Card className="p-6 space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-primary" />
        Tâches prioritaires
      </h3>

      <div className="space-y-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-center justify-between p-4 rounded-lg border animate-fade-in hover:shadow-md transition-all ${getPriorityColor(task.priority)}`}
          >
            <p className="text-sm">{task.message}</p>
            <Button
              variant="default"
              onClick={() => handleTaskClick(task)}
              className="whitespace-nowrap ml-4 group hover:scale-105 transition-all"
            >
              {task.action}
              <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
};