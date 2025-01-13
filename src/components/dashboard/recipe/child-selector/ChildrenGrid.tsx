import { ChildProfile } from '../../types';
import { ChildCard } from './ChildCard';

interface ChildrenGridProps {
  children: ChildProfile[];
  selectedChildren: ChildProfile[];
  onToggleChild: (child: ChildProfile) => void;
  mode?: 'default' | 'compact';
}

export const ChildrenGrid = ({ 
  children, 
  selectedChildren, 
  onToggleChild,
  mode = 'default'
}: ChildrenGridProps) => (
  <div className={`grid grid-cols-1 ${mode === 'compact' ? 'sm:grid-cols-3 gap-3' : 'sm:grid-cols-2 gap-4'}`}>
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