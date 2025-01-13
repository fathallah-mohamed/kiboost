import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChildProfile } from '../types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';

interface MultiChildSelectorProps {
  onSelectChildren: (children: ChildProfile[]) => void;
  selectedChildren: ChildProfile[];
  mode?: 'compact' | 'full';
}

export const MultiChildSelector = ({ 
  onSelectChildren, 
  selectedChildren,
  mode = 'full'
}: MultiChildSelectorProps) => {
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;

      const { data, error } = await supabase
        .from('children_profiles')
        .select('*')
        .eq('profile_id', session.session.user.id);

      if (error) throw error;
      setChildren(data || []);
    } catch (error) {
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
    let newSelection: ChildProfile[];
    
    if (isSelected) {
      newSelection = selectedChildren.filter(c => c.id !== child.id);
    } else {
      newSelection = [...selectedChildren, child];
    }
    
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
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Sélection des enfants</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="rounded-full"
            onClick={handleSelectAll}
          >
            Tout sélectionner
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="rounded-full"
            onClick={handleDeselectAll}
          >
            Tout désélectionner
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {children.map((child) => (
          <Card
            key={child.id}
            className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
              selectedChildren.some(c => c.id === child.id)
                ? 'ring-1 ring-primary'
                : ''
            }`}
            onClick={() => handleToggleChild(child)}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h4 className="text-lg font-medium">{child.name}</h4>
                <p className="text-sm text-gray-600">{child.age} ans</p>
                {child.allergies?.length > 0 && (
                  <p className="text-sm text-gray-600">
                    Allergies: {child.allergies.join(', ')}
                  </p>
                )}
                {child.preferences?.length > 0 && (
                  <p className="text-sm text-gray-600">
                    Préférences: {child.preferences.join(', ')}
                  </p>
                )}
              </div>
              <Checkbox
                checked={selectedChildren.some(c => c.id === child.id)}
                className="mt-1"
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};