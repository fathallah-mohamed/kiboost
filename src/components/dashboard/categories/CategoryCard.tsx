import { Category } from "../types/category";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Utensils, Brain, Dumbbell, Users, 
  GraduationCap, MapPin, Heart, Plane,
  LucideIcon 
} from "lucide-react";

interface CategoryCardProps {
  category: Category;
  onSectionChange?: (section: string) => void;
}

const iconMap: Record<string, LucideIcon> = {
  Utensils,
  Brain,
  Dumbbell,
  Users,
  GraduationCap,
  MapPin,
  Heart,
  Plane
};

export const CategoryCard = ({ category, onSectionChange }: CategoryCardProps) => {
  const Icon = iconMap[category.icon as keyof typeof iconMap];

  const handleClick = () => {
    if (category.isActive) {
      if (category.id === 'recipes') {
        onSectionChange?.('recipes');
      } else if (category.route) {
        // Handle other routes when implemented
        toast.info(category.comingSoonMessage || "Cette fonctionnalité sera bientôt disponible !");
      }
    } else {
      toast.info(category.comingSoonMessage || "Cette fonctionnalité sera bientôt disponible !");
    }
  };

  return (
    <Card 
      className={`relative p-6 h-full flex flex-col transition-all duration-300 hover:shadow-lg cursor-pointer ${
        !category.isActive ? 'opacity-75' : ''
      }`}
      onClick={handleClick}
    >
      {!category.isActive && (
        <Badge 
          variant="secondary" 
          className="absolute top-4 right-4"
        >
          Bientôt disponible
        </Badge>
      )}

      <div className="flex items-center justify-center mb-4">
        {Icon && <Icon className="w-12 h-12 text-primary" />}
      </div>

      <h3 className="text-xl font-bold mb-2">{category.title}</h3>
      <p className="text-lg font-semibold text-primary mb-2">{category.slogan}</p>
      <p className="text-muted-foreground mb-4 flex-grow">{category.description}</p>

      <Button 
        variant={category.isActive ? "default" : "secondary"}
        className="w-full"
        disabled={!category.isActive}
      >
        {category.isActive ? "Explorer" : "Bientôt disponible"}
      </Button>
    </Card>
  );
};