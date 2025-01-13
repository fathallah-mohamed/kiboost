import { ChildProfile } from '../../types';
import { ChildCard } from './ChildCard';

interface ChildrenGridProps {
  children: ChildProfile[];
  selectedChildren: ChildProfile[];
  onToggleChild: (child: ChildProfile) => void;
}

export const ChildrenGrid = ({ children, selectedChildren, onToggleChild }: ChildrenGridProps) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    {children.map((child) => (
      <ChildCard
        key={child.id}
        child={child}
        isSelected={selectedChildren.some(c => c.id === child.id)}
        onToggle={onToggleChild}
      />
    ))}
  </div>
);