import { Recipe, ChildProfile } from "../types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, User } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { RecipeCard } from "../recipe/RecipeCard";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PlannedMealCardProps {
  recipe: Recipe;
  children: ChildProfile[];
  onRemove: () => void;
}

export const PlannedMealCard = ({ recipe, children, onRemove }: PlannedMealCardProps) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {children.length > 1 ? (
            <div className="flex -space-x-2">
              {children.map(child => (
                <TooltipProvider key={child.id}>
                  <Tooltip>
                    <TooltipTrigger>
                      <Avatar className="border-2 border-background">
                        <span className="text-xs">{getInitials(child.name)}</span>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{child.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Avatar>
                    <User className="h-4 w-4" />
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{children[0].name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      
      <RecipeCard recipe={recipe} compact />
    </Card>
  );
};