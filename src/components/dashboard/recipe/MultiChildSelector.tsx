import { useState, useEffect } from 'react';
import { ChildProfile } from '../types';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SelectionHeader } from './child-selector/SelectionHeader';
import { ChildrenGrid } from './child-selector/ChildrenGrid';

interface MultiChildSelectorProps {
  onSelectChildren: (children: ChildProfile[]) => void;
  selectedChildren: ChildProfile[];
}

export const MultiChildSelector = ({ 
  onSelectChildren,
  selectedChildren,
}: MultiChildSelectorProps) => {
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('children_profiles')
        .select('*')
        .eq('profile_id', session.user.id);

      if (error) throw error;
      setChildren(data || []);
    } catch (error) {
      console.error('Error fetching children:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les profils des enfants.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleChild = (child: ChildProfile) => {
    const isSelected = selectedChildren.some(c => c.id === child.id);
    const newSelection = isSelected
      ? selectedChildren.filter(c => c.id !== child.id)
      : [...selectedChildren, child];
    onSelectChildren(newSelection);
  };

  const handleSelectAll = () => {
    onSelectChildren(children);
  };

  const handleDeselectAll = () => {
    onSelectChildren([]);
  };

  if (loading) {
    return <div>Chargement des profils...</div>;
  }

  return (
    <div className="space-y-4">
      <SelectionHeader
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
      />
      <ChildrenGrid
        children={children}
        selectedChildren={selectedChildren}
        onToggleChild={handleToggleChild}
      />
    </div>
  );
};