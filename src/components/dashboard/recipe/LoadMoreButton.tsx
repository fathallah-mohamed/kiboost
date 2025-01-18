import { Button } from "@/components/ui/button";

interface LoadMoreButtonProps {
  displayCount: number;
  totalCount: number;
  onLoadMore: () => void;
}

export const LoadMoreButton = ({ displayCount, totalCount, onLoadMore }: LoadMoreButtonProps) => {
  if (displayCount >= totalCount) return null;

  return (
    <div className="flex justify-center">
      <Button 
        variant="outline" 
        onClick={onLoadMore}
        className="mt-4"
      >
        Voir plus de recettes
      </Button>
    </div>
  );
};