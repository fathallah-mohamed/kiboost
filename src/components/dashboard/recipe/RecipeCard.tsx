import { Card } from "@/components/ui/card";
import { Recipe } from "../types";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Utensils, Clock, Heart } from "lucide-react";

interface RecipeCardProps {
  recipe: Recipe;
}

export const RecipeCard = ({ recipe }: RecipeCardProps) => {
  const nutritionalData = [
    { name: 'Calories', value: recipe.nutritional_info.calories, color: '#FF9494' },
    { name: 'Protéines', value: recipe.nutritional_info.protein, color: '#94B3FD' },
    { name: 'Glucides', value: recipe.nutritional_info.carbs, color: '#FFD1D1' },
    { name: 'Lipides', value: recipe.nutritional_info.fat, color: '#B983FF' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-primary mb-2">{recipe.name}</h3>
        <div className="flex justify-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Utensils className="w-4 h-4" />
            Facile
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            15 min
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            Healthy
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4 bg-secondary/10">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Utensils className="w-4 h-4 text-primary" />
            Ingrédients
          </h4>
          <ul className="space-y-2">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs">
                  {index + 1}
                </span>
                <span>
                  {ingredient.quantity} {ingredient.unit} {ingredient.item}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-4 bg-secondary/10">
          <h4 className="font-semibold mb-4">Instructions</h4>
          <ol className="space-y-2">
            {recipe.instructions.map((step, index) => (
              <li key={index} className="flex gap-2 text-sm">
                <span className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-xs shrink-0">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      <Card className="p-4">
        <h4 className="font-semibold mb-4 text-center">Valeurs nutritionnelles</h4>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={nutritionalData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '8px'
                }}
              />
              <Bar 
                dataKey="value" 
                fill="var(--color)"
                radius={[4, 4, 0, 0]}
                data={nutritionalData.map(item => ({
                  ...item,
                  fill: item.color
                }))}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};