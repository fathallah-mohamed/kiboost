import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChildProfile } from '../types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

interface ChildSelectorProps {
  onSelectChild: (child: ChildProfile | null) => void;
  selectedChild: ChildProfile | null;
}

export const ChildSelector = ({ onSelectChild, selectedChild }: ChildSelectorProps) => {
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

      // Si un seul enfant, le sélectionner automatiquement
      if (data && data.length === 1 && !selectedChild) {
        onSelectChild(data[0]);
      }
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

  if (loading) {
    return <div>Chargement des profils...</div>;
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Choisir un enfant</label>
      <Select 
        value={selectedChild?.id} 
        onValueChange={(value) => {
          const child = children.find(c => c.id === value);
          onSelectChild(child || null);
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Sélectionner un enfant" />
        </SelectTrigger>
        <SelectContent>
          {children.map((child) => (
            <SelectItem key={child.id} value={child.id}>
              {child.name} ({child.age} ans)
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};