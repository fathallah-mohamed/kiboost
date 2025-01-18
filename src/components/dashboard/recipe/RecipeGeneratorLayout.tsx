import { BackToDashboard } from "../BackToDashboard";

interface RecipeGeneratorLayoutProps {
  onSectionChange: (section: string) => void;
  children: React.ReactNode;
}

export const RecipeGeneratorLayout = ({ onSectionChange, children }: RecipeGeneratorLayoutProps) => {
  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <BackToDashboard onBack={() => onSectionChange('overview')} />
      </div>
      {children}
    </div>
  );
};