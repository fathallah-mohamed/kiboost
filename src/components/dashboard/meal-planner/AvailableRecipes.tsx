import { Recipe, ChildProfile } from '../types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Clock, Utensils } from 'lucide-react';
import { useFavorites } from '../recipe/hooks/useFavorites';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface AvailableRecipesProps {
  recipes: Recipe[];
  loading: boolean;
  planningRecipe: boolean;
  onPlanRecipe: (recipe: Recipe) => void;
  selectedChildren: ChildProfile[];
}

export const AvailableRecipes = ({ 
  recipes, 
  loading, 
  planningRecipe, 
  onPlanRecipe,
  selectedChildren
}: AvailableRecipesProps) => {
  const { favoriteRecipes } = useFavorites();
  const [searchTerm, setSearchTerm] = useState('');

  if (loading) {
    return <p>Chargement des recettes...</p>;
  }

  if (recipes.length === 0) {
    return <p>Aucune recette disponible. Générez d'abord des recettes dans l'onglet "Recettes".</p>;
  }

  // Filtrer les doublons et les recettes qui ne correspondent pas aux critères des enfants
  const filteredRecipes = recipes.reduce((acc: Recipe[], current) => {
    const normalizedName = current.name.toLowerCase();
    const exists = acc.some(recipe => recipe.name.toLowerCase() === normalizedName);
    
    // Vérifier si la recette correspond aux critères des enfants sélectionnés
    const isCompatible = selectedChildren.length === 0 || selectedChildren.every(child => {
      // Vérifier les allergies
      const hasNoAllergies = child.allergies.every(allergy => 
        !current.allergens?.includes(allergy)
      );
      
      // Vérifier l'âge
      const childAge = new Date().getFullYear() - new Date(child.birth_date).getFullYear();
      const isAgeAppropriate = (current.min_age === undefined || childAge >= current.min_age) &&
                              (current.max_age === undefined || childAge <= current.max_age);
      
      return hasNoAllergies && isAgeAppropriate;
    });

    // Filtrer par terme de recherche
    const matchesSearch = searchTerm === '' || 
      current.name.toLowerCase().includes(searchTerm.toLowerCase());

    if (!exists && isCompatible && matchesSearch) {
      acc.push(current);
    }
    return acc;
  }, []);

  // Trier les recettes pour afficher les favoris en premier
  const sortedRecipes = [...filteredRecipes].sort((a, b) => {
    const aIsFavorite = favoriteRecipes.includes(a.id);
    const bIsFavorite = favoriteRecipes.includes(b.id);
    if (aIsFavorite && !bIsFavorite) return -1;
    if (!aIsFavorite && bIsFavorite) return 1;
    return 0;
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Recettes disponibles</h3>
        <Input
          type="search"
          placeholder="Rechercher une recette..."
          className="max-w-xs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedRecipes.map((recipe) => (
          <Card key={recipe.id} className={`p-4 ${favoriteRecipes.includes(recipe.id) ? 'border-primary' : ''}`}>
            <div className="flex flex-col h-full">
              <div className="flex-1">
                <h4 className="font-medium mb-2">
                  {favoriteRecipes.includes(recipe.id) && (
                    <span className="text-primary mr-2">★</span>
                  )}
                  {recipe.name}
                </h4>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {recipe.preparation_time} min
                  </span>
                  <span className="flex items-center gap-1">
                    <Utensils className="w-4 h-4" />
                    {recipe.difficulty}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {recipe.nutritional_info.calories} calories
                </p>
                {selectedChildren.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-primary">
                      Compatible avec : {selectedChildren.map(child => child.name).join(', ')}
                    </p>
                  </div>
                )}
              </div>
              <Button 
                className="mt-4 w-full"
                onClick={() => onPlanRecipe(recipe)}
                disabled={planningRecipe}
              >
                Planifier
                {selectedChildren.length > 0 && ` pour ${selectedChildren.length} enfant${selectedChildren.length > 1 ? 's' : ''}`}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};