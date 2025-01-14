import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AddChildFormProps {
  userId: string;
  onChildAdded: () => void;
}

export const AddChildForm = ({ userId, onChildAdded }: AddChildFormProps) => {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [allergies, setAllergies] = useState('');
  const [preferences, setPreferences] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('children_profiles')
        .insert([
          {
            profile_id: userId,
            name,
            birth_date: birthDate,
            allergies: allergies.split(',').map(a => a.trim()),
            preferences: preferences.split(',').map(p => p.trim()),
          }
        ]);

      if (error) throw error;

      setName('');
      setBirthDate('');
      setAllergies('');
      setPreferences('');
      onChildAdded();

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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          placeholder="Nom"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
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
  );
};