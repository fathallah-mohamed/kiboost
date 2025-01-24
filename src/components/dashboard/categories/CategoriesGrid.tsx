import { categories } from "../data/categories";
import { CategoryCard } from "./CategoryCard";

interface CategoriesGridProps {
  onSectionChange?: (section: string) => void;
}

export const CategoriesGrid = ({ onSectionChange }: CategoriesGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
      {categories.map((category) => (
        <CategoryCard 
          key={category.id} 
          category={category} 
          onSectionChange={onSectionChange}
        />
      ))}
    </div>
  );
};