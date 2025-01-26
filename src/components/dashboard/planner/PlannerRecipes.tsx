import { AvailableRecipes } from '../meal-planner/AvailableRecipes';
import { Recipe } from '../types';

interface PlannerRecipesProps {
  recipes: Recipe[];
  loading: boolean;
  planningRecipe: boolean | null;
  onPlanRecipe: (recipe: Recipe) => void;
}

export const PlannerRecipes = ({
  recipes,
  loading,
  planningRecipe,
  onPlanRecipe
}: PlannerRecipesProps) => {
  return (
    <AvailableRecipes
      recipes={recipes}
      loading={loading}
      planningRecipe={planningRecipe}
      onPlanRecipe={onPlanRecipe}
    />
  );
};