import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface MealStatistic {
  frequency: number | null;
  recipes: {
    name: string;
  } | null;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export const MealFrequency = () => {
  const { data: frequencyData, isLoading } = useQuery({
    queryKey: ["mealFrequency"],
    queryFn: async () => {
      const { data: statistics, error } = await supabase
        .from("meal_statistics")
        .select(`
          frequency,
          recipes (
            name
          )
        `)
        .order("frequency", { ascending: false })
        .limit(5);

      if (error) throw error;

      return (statistics as unknown as MealStatistic[]).map((stat) => ({
        name: stat.recipes?.name || "Unknown Recipe",
        value: stat.frequency || 0,
      }));
    },
  });

  if (isLoading) {
    return <div>Chargement des statistiques de fréquence...</div>;
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Top 5 des repas les plus servis</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={frequencyData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {frequencyData?.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};