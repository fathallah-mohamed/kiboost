import { ChildProfile } from '../../types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserRound, Users, UserMinus, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChildrenSelectorProps {
  children: ChildProfile[];
  selectedChildren: ChildProfile[];
  onSelectionChange: (children: ChildProfile[]) => void;
}

const CHILD_COLORS = [
  'hover:bg-pink-100 border-pink-300',
  'hover:bg-blue-100 border-blue-300',
  'hover:bg-purple-100 border-purple-300',
  'hover:bg-green-100 border-green-300',
  'hover:bg-yellow-100 border-yellow-300',
];

export const ChildrenSelector = ({
  children,
  selectedChildren,
  onSelectionChange,
}: ChildrenSelectorProps) => {
  const handleSelectAll = () => {
    onSelectionChange(children);
  };

  const handleDeselectAll = () => {
    onSelectionChange([]);
  };

  const toggleChild = (child: ChildProfile) => {
    const isSelected = selectedChildren.some(c => c.id === child.id);
    if (isSelected) {
      onSelectionChange(selectedChildren.filter(c => c.id !== child.id));
    } else {
      onSelectionChange([...selectedChildren, child]);
    }
  };

  const getChildColor = (index: number) => {
    return CHILD_COLORS[index % CHILD_COLORS.length];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Sélection des enfants</h3>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Tout sélectionner
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeselectAll}
            className="flex items-center gap-2"
          >
            <UserMinus className="h-4 w-4" />
            Tout désélectionner
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {children.map((child, index) => {
          const isSelected = selectedChildren.some(c => c.id === child.id);
          return (
            <Button
              key={child.id}
              variant={isSelected ? "default" : "outline"}
              onClick={() => toggleChild(child)}
              className={cn(
                "flex items-center gap-2 transition-colors",
                !isSelected && getChildColor(index)
              )}
            >
              <UserRound className="h-4 w-4" />
              {child.name}
            </Button>
          );
        })}
      </div>
    </div>
  );
};