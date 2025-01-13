import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChildProfile } from '../types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
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

  if (mode === 'compact') {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {selectedChildren.length === 0 
              ? 'Aucun enfant sélectionné'
              : `${selectedChildren.length} enfant(s) sélectionné(s)`}
          </span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={selectedChildren.length === children.length ? handleDeselectAll : handleSelectAll}
          >
            {selectedChildren.length === children.length ? 'Tout désélectionner' : 'Tout sélectionner'}
          </Button>
        </div>
        <ScrollArea className="h-24 rounded-md border">
          <div className="p-4 space-y-2">
            {children.map((child) => (
              <div key={child.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`child-${child.id}`}
                  checked={selectedChildren.some(c => c.id === child.id)}
                  onCheckedChange={() => handleToggleChild(child)}
                />
                <label
                  htmlFor={`child-${child.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {child.name} ({child.age} ans)
                </label>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Sélection des enfants</h3>
        <div className="space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleSelectAll}
          >
            Tout sélectionner
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDeselectAll}
          >
            Tout désélectionner
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {children.map((child) => (
          <Card
            key={child.id}
            className={`p-4 cursor-pointer transition-colors ${
              selectedChildren.some(c => c.id === child.id)
                ? 'ring-2 ring-primary'
                : ''
            }`}
            onClick={() => handleToggleChild(child)}
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold">{child.name}</h4>
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
                onCheckedChange={() => handleToggleChild(child)}
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};