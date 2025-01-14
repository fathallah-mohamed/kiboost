import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Edit2, Save } from 'lucide-react';
import { ChildProfile } from '../types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChildCardProps {
  child: ChildProfile;
  isSelected: boolean;
  onSelect: (child: ChildProfile) => void;
  onDelete: (id: string) => void;
  onUpdate: () => void;
}

export const ChildCard = ({ child, isSelected, onSelect, onDelete, onUpdate }: ChildCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(child.name);
  const [editedBirthDate, setEditedBirthDate] = useState(child.birth_date);
  const [editedAllergies, setEditedAllergies] = useState(child.allergies.join(', '));
  const [editedPreferences, setEditedPreferences] = useState(child.preferences.join(', '));
  const { toast } = useToast();

  const handleUpdate = async () => {
    try {
      const { error } = await supabase
        .from('children_profiles')
        .update({
          name: editedName,
          birth_date: editedBirthDate,
          allergies: editedAllergies.split(',').map(a => a.trim()),
          preferences: editedPreferences.split(',').map(p => p.trim()),
        })
        .eq('id', child.id);

      if (error) throw error;

      setIsEditing(false);
      onUpdate();
      
      toast({
        title: "Profil mis à jour",
        description: "Le profil a été mis à jour avec succès.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour le profil.",
      });
    }
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (isEditing) {
    return (
      <Card className="p-4 space-y-4">
        <div className="space-y-2">
          <Input
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            placeholder="Nom"
          />
          <Input
            type="date"
            value={editedBirthDate}
            onChange={(e) => setEditedBirthDate(e.target.value)}
          />
          <Input
            value={editedAllergies}
            onChange={(e) => setEditedAllergies(e.target.value)}
            placeholder="Allergies (séparées par des virgules)"
          />
          <Input
            value={editedPreferences}
            onChange={(e) => setEditedPreferences(e.target.value)}
            placeholder="Préférences (séparées par des virgules)"
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Annuler
          </Button>
          <Button onClick={handleUpdate}>
            <Save className="w-4 h-4 mr-2" />
            Enregistrer
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className={`p-4 relative cursor-pointer transition-colors ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={() => onSelect(child)}
    >
      <div className="absolute top-2 right-2 flex space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
        >
          <Edit2 className="w-4 h-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => e.stopPropagation()}
            >
              <X className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer le profil de {child.name} ? Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(child.id)}>
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <h3 className="font-semibold text-lg mb-2">{child.name}</h3>
      <p className="text-gray-600">Âge: {calculateAge(child.birth_date)} ans</p>
      {child.allergies.length > 0 && (
        <p className="text-gray-600">
          Allergies: {child.allergies.join(', ')}
        </p>
      )}
      {child.preferences.length > 0 && (
        <p className="text-gray-600">
          Préférences: {child.preferences.join(', ')}
        </p>
      )}
    </Card>
  );
};