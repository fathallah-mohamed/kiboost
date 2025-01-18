import { RecipeGeneratorLayout } from './recipe/RecipeGeneratorLayout';
import { RecipeGeneratorContent } from './recipe/RecipeGeneratorContent';
import { useRecipeGeneration } from './recipe/useRecipeGeneration';
import { useState } from 'react';
import { Recipe, ChildProfile } from './types';

interface RecipeGeneratorProps {
  onSectionChange: (section: string) => void;
}

export const RecipeGenerator = ({ onSectionChange }: RecipeGeneratorProps) => {
  const [selectedChildren, setSelectedChildren] = useState<ChildProfile[]>([]);
  const [displayCount, setDisplayCount] = useState(3);
  const [plannedRecipes, setPlannedRecipes] = useState<{ [key: string]: Recipe | null }>({});
  const { recipes, loading, error, generateRecipes } = useRecipeGeneration();
  const [saving, setSaving] = useState(false);

  const handleGenerateRecipes = async () => {
    if (selectedChildren.length === 0) return;
    await generateRecipes(selectedChildren[0]);
  };

  const handleSaveRecipe = async (recipe: Recipe) => {
    setSaving(true);
    // Implement save logic here
    setSaving(false);
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