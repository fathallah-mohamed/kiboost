import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronRight } from "lucide-react";
import { format, startOfWeek, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

export const WeeklyOverview = () => {
  const navigate = useNavigate();
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  
  const plannedDays = ["2024-01-22", "2024-01-23", "2024-01-24"];

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    const formattedDate = format(date, "yyyy-MM-dd");
    const isPlanned = plannedDays.includes(formattedDate);
    const isToday = format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
    
    return {
      date,
      isPlanned,
      isToday,
      dayName: format(date, "EEE", { locale: fr }),
      dayNumber: format(date, "d")
    };
  });

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Aperçu de la semaine
        </h3>
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard/view-planner")}
          className="text-sm group"
        >
          Voir le planning complet
          <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => (
          <div
            key={day.date.toString()}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              day.isToday
                ? "bg-primary text-primary-foreground"
                : day.isPlanned
                ? "bg-primary/10 text-primary"
                : "bg-gray-50 text-gray-500"
            }`}
          >
            <span className="text-xs font-medium">{day.dayName}</span>
            <span className="text-sm font-bold">{day.dayNumber}</span>
            <div
              className={`w-2 h-2 rounded-full mt-1 ${
                day.isPlanned ? "bg-primary" : "bg-gray-300"
              }`}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span>Jours planifiés</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-300" />
          <span>Jours à planifier</span>
        </div>
      </div>
    </Card>
  );
};