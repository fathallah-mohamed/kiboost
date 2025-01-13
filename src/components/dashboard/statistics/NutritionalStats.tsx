import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { fr } from "date-fns/locale";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface NutritionalInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface MealPlanResponse {
  date: string;
  recipes: {
    nutritional_info: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
  } | null;
}

export const NutritionalStats = () => {
  const startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
  const endDate = endOfWeek(new Date(), { weekStartsOn: 1 });

  const { data: weeklyNutrition, isLoading } = useQuery({
    queryKey: ["weeklyNutrition", startDate, endDate],
    queryFn: async () => {
      const { data: mealPlans, error } = await supabase
        .from("meal_plans")
        .select(`
          date,
          recipes (
            nutritional_info
          )
        `)
        .gte("date", format(startDate, "yyyy-MM-dd"))
        .lte("date", format(endDate, "yyyy-MM-dd"));

      if (error) throw error;

      const dailyNutrition = (mealPlans as MealPlanResponse[]).reduce((acc: Record<string, any>, plan) => {
        const date = format(new Date(plan.date), "EEEE", { locale: fr });
        const defaultNutrition: NutritionalInfo = {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
        };

        if (!acc[date]) {
          acc[date] = {
            day: date,
            ...defaultNutrition,
          };
        }

        if (plan.recipes?.nutritional_info) {
          const nutrition = plan.recipes.nutritional_info;
          acc[date].calories += nutrition.calories || 0;
          acc[date].protein += nutrition.protein || 0;
          acc[date].carbs += nutrition.carbs || 0;
          acc[date].fat += nutrition.fat || 0;
        }

        return acc;
      }, {});

      return Object.values(dailyNutrition);
    },
  });

  if (isLoading) {
    return <div>Chargement des statistiques nutritionnelles...</div>;
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Apports nutritionnels de la semaine</h3>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyNutrition}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="calories" fill="#8884d8" name="Calories" />
            <Bar dataKey="protein" fill="#82ca9d" name="Protéines (g)" />
            <Bar dataKey="carbs" fill="#ffc658" name="Glucides (g)" />
            <Bar dataKey="fat" fill="#ff7300" name="Lipides (g)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};