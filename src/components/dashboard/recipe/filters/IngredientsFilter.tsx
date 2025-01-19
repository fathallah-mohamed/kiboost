import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface IngredientsFilterProps {
  includedIngredients: string[];
  excludedIngredients: string[];
  onIncludedChange: (ingredients: string[]) => void;
  onExcludedChange: (ingredients: string[]) => void;
}

export const IngredientsFilter = ({
  includedIngredients,
  excludedIngredients,
  onIncludedChange,
  onExcludedChange,
}: IngredientsFilterProps) => {
  const [newIncluded, setNewIncluded] = useState("");
  const [newExcluded, setNewExcluded] = useState("");

  const handleAddIncluded = () => {
    if (newIncluded.trim()) {
      onIncludedChange([...includedIngredients, newIncluded.trim()]);
      setNewIncluded("");
    }
  };

  const handleAddExcluded = () => {
    if (newExcluded.trim()) {
      onExcludedChange([...excludedIngredients, newExcluded.trim()]);
      setNewExcluded("");
    }
  };

  const removeIncluded = (ingredient: string) => {
    onIncludedChange(includedIngredients.filter(i => i !== ingredient));
  };

  const removeExcluded = (ingredient: string) => {
    onExcludedChange(excludedIngredients.filter(i => i !== ingredient));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Plus className="w-4 h-4 text-primary" />
          Ingrédients à inclure
        </Label>
        <div className="flex gap-2">
          <Input
            value={newIncluded}
            onChange={(e) => setNewIncluded(e.target.value)}
            placeholder="Ex: carottes"
            onKeyPress={(e) => e.key === 'Enter' && handleAddIncluded()}
          />
          <Button onClick={handleAddIncluded} variant="outline">
            Ajouter
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {includedIngredients.map((ingredient) => (
            <Badge
              key={ingredient}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {ingredient}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => removeIncluded(ingredient)}
              />
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Minus className="w-4 h-4 text-destructive" />
          Ingrédients à exclure
        </Label>
        <div className="flex gap-2">
          <Input
            value={newExcluded}
            onChange={(e) => setNewExcluded(e.target.value)}
            placeholder="Ex: gluten"
            onKeyPress={(e) => e.key === 'Enter' && handleAddExcluded()}
          />
          <Button onClick={handleAddExcluded} variant="outline">
            Ajouter
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {excludedIngredients.map((ingredient) => (
            <Badge
              key={ingredient}
              variant="destructive"
              className="flex items-center gap-1"
            >
              {ingredient}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => removeExcluded(ingredient)}
              />
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};