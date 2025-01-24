import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ChildProfile } from '../../types';
import { Users, UserCheck, UserX } from 'lucide-react';

interface ChildrenSelectorProps {
  children: ChildProfile[];
  selectedChildren: ChildProfile[];
  onSelectionChange: (children: ChildProfile[]) => void;
}

export const ChildrenSelector = ({
  children,
  selectedChildren,
  onSelectionChange,
}: ChildrenSelectorProps) => {
  const [expanded, setExpanded] = useState(true);

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

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Sélection des enfants</h3>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            className="flex items-center gap-2"
          >
            <UserCheck className="w-4 h-4" />
            Tout sélectionner
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeselectAll}
            className="flex items-center gap-2"
          >
            <UserX className="w-4 h-4" />
            Tout désélectionner
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {children.map((child) => {
          const isSelected = selectedChildren.some(c => c.id === child.id);
          return (
            <Card
              key={child.id}
              className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
              }`}
              onClick={() => toggleChild(child)}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="font-medium">{child.name}</div>
                  {child.allergies.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      Allergies: {child.allergies.join(', ')}
                    </div>
                  )}
                  {child.preferences.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      Préférences: {child.preferences.join(', ')}
                    </div>
                  )}
                </div>
                <Checkbox checked={isSelected} />
              </div>
            </Card>
          );
        })}
      </div>
    </Card>
  );
};