import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Plus, X } from 'lucide-react';

interface ChildProfile {
  id: string;
  name: string;
  age: number;
  allergies: string[];
  preferences: string[];
}

interface ChildrenProfilesProps {
  userId: string;
}

export const ChildrenProfiles = ({ userId }: ChildrenProfilesProps) => {
  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [allergies, setAllergies] = useState('');
  const [preferences, setPreferences] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchProfiles();
  }, [userId]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('children_profiles')
        .insert([
          {
            profile_id: userId,
            name,
            age: parseInt(age),
            allergies: allergies.split(',').map(a => a.trim()),
            preferences: preferences.split(',').map(p => p.trim()),
          }
        ])
        .select();

      if (error) throw error;

      setProfiles([...profiles, data[0]]);
      setName('');
      setAge('');
      setAllergies('');
      setPreferences('');

      toast({
        title: "Profil créé",
        description: "Le profil a été créé avec succès.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer le profil.",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('children_profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProfiles(profiles.filter(profile => profile.id !== id));
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

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Profils des enfants</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Nom"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            type="number"
            placeholder="Âge"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
          />
          <Input
            placeholder="Allergies (séparées par des virgules)"
            value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
          />
          <Input
            placeholder="Préférences (séparées par des virgules)"
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
          />
        </div>
        <Button type="submit">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un profil
        </Button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {profiles.map((profile) => (
          <Card key={profile.id} className="p-4 relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => handleDelete(profile.id)}
            >
              <X className="w-4 h-4" />
            </Button>
            <h3 className="font-semibold text-lg mb-2">{profile.name}</h3>
            <p className="text-gray-600">Âge: {profile.age} ans</p>
            {profile.allergies.length > 0 && (
              <p className="text-gray-600">
                Allergies: {profile.allergies.join(', ')}
              </p>
            )}
            {profile.preferences.length > 0 && (
              <p className="text-gray-600">
                Préférences: {profile.preferences.join(', ')}
              </p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};