import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Edit2 } from 'lucide-react';
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
import { AgeDisplay } from './child-card/AgeDisplay';
import { ChildInfo } from './child-card/ChildInfo';
import { EditForm } from './child-card/EditForm';

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

  if (isEditing) {
    return (
      <Card className="p-4 space-y-4">
        <EditForm
          name={editedName}
          birthDate={editedBirthDate}
          allergies={editedAllergies}
          preferences={editedPreferences}
          onNameChange={setEditedName}
          onBirthDateChange={setEditedBirthDate}
          onAllergiesChange={setEditedAllergies}
          onPreferencesChange={setEditedPreferences}
          onCancel={() => setIsEditing(false)}
          onSave={handleUpdate}
        />
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
      <AgeDisplay birthDate={child.birth_date} />
      <ChildInfo
        label="Allergies"
        items={child.allergies}
        emptyMessage="Aucune allergie connue"
      />
      <ChildInfo
        label="Préférences"
        items={child.preferences}
        emptyMessage="Aucune préférence renseignée"
      />
    </Card>
  );
};