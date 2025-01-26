import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ChildProfile } from './types';
import { AddChildForm } from './children/AddChildForm';
import { ChildCard } from './children/ChildCard';
import { BackToDashboard } from './BackToDashboard';

interface ChildrenProfilesProps {
  userId: string;
  onSelectChild?: (child: ChildProfile | null) => void;
}

export const ChildrenProfiles = ({ userId, onSelectChild }: ChildrenProfilesProps) => {
  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('children_profiles')
        .select('*')
        .eq('profile_id', userId);

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les profils.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [userId]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('children_profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProfiles(profiles.filter(profile => profile.id !== id));
      if (selectedProfileId === id) {
        setSelectedProfileId(null);
        onSelectChild?.(null);
      }
      
      toast({
        title: "Profil supprimé",
        description: "Le profil a été supprimé avec succès.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer le profil.",
      });
    }
  };

  const handleSelectProfile = (profile: ChildProfile) => {
    const newSelectedId = selectedProfileId === profile.id ? null : profile.id;
    setSelectedProfileId(newSelectedId);
    onSelectChild?.(newSelectedId ? profile : null);
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <BackToDashboard />
      
      <h2 className="text-2xl font-bold">Profils des enfants</h2>
      <AddChildForm userId={userId} onChildAdded={fetchProfiles} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {profiles.map((profile) => (
          <ChildCard
            key={profile.id}
            child={profile}
            isSelected={selectedProfileId === profile.id}
            onSelect={handleSelectProfile}
            onDelete={handleDelete}
            onUpdate={fetchProfiles}
          />
        ))}
      </div>
    </div>
  );
};