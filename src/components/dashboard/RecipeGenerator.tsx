import { RecipeGeneratorLayout } from './recipe/RecipeGeneratorLayout';
import { RecipeGeneratorContent } from './recipe/RecipeGeneratorContent';
import { useRecipeGeneration } from './recipe/useRecipeGeneration';
import { useState } from 'react';
import { Recipe, ChildProfile } from './types';
import { useRecipeSaving } from './recipe/hooks/useRecipeSaving';
import { toast } from 'sonner';

interface RecipeGeneratorProps {
  onSectionChange: (section: string) => void;
}

export const RecipeGenerator = ({ onSectionChange }: RecipeGeneratorProps) => {
  const [selectedChildren, setSelectedChildren] = useState<ChildProfile[]>([]);
  const [displayCount, setDisplayCount] = useState(3);
  const [plannedRecipes, setPlannedRecipes] = useState<{ [key: string]: Recipe | null }>({});
  const { recipes, loading, error, generateRecipes } = useRecipeGeneration();
  const { saveRecipe, saving } = useRecipeSaving();

  const handleGenerateRecipes = async () => {
    if (selectedChildren.length === 0) {
      toast.error("Veuillez sélectionner au moins un enfant");
      return;
    }
    await generateRecipes(selectedChildren[0]);
  };

  const handleSaveRecipe = async (recipe: Recipe) => {
    if (selectedChildren.length === 0) {
      toast.error("Veuillez sélectionner au moins un enfant");
      return;
    }
    const savedRecipe = await saveRecipe(recipe, selectedChildren);
    if (savedRecipe) {
      setPlannedRecipes(prev => ({
        ...prev,
        [savedRecipe.id]: savedRecipe
      }));
    }
  };

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 3);
  };

  return (
    <RecipeGeneratorLayout onSectionChange={onSectionChange}>
      <RecipeGeneratorContent
        loading={loading}
        saving={saving}
        selectedChildren={selectedChildren}
        setSelectedChildren={setSelectedChildren}
        recipes={recipes}
        displayCount={displayCount}
        error={error}
        plannedRecipes={plannedRecipes}
        handleGenerateRecipes={handleGenerateRecipes}
        handleSaveRecipe={handleSaveRecipe}
        handleLoadMore={handleLoadMore}
      />
    </RecipeGeneratorLayout>
  );
};