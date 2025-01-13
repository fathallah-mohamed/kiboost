import { Button } from "@/components/ui/button";

interface LoadMoreButtonProps {
  visible: boolean;
  onClick: () => void;
}

export const LoadMoreButton = ({ visible, onClick }: LoadMoreButtonProps) => {
  if (!visible) return null;

  return (
    <div className="flex justify-center">
      <Button 
        variant="outline" 
        onClick={onClick}
        className="mt-4"
      >
        Voir plus de recettes
      </Button>
    </div>
  );
};