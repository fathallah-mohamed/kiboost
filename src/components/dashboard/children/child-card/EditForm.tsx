import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

interface EditFormProps {
  name: string;
  birthDate: string;
  allergies: string;
  preferences: string;
  onNameChange: (value: string) => void;
  onBirthDateChange: (value: string) => void;
  onAllergiesChange: (value: string) => void;
  onPreferencesChange: (value: string) => void;
  onCancel: () => void;
  onSave: () => void;
}

export const EditForm = ({
  name,
  birthDate,
  allergies,
  preferences,
  onNameChange,
  onBirthDateChange,
  onAllergiesChange,
  onPreferencesChange,
  onCancel,
  onSave,
}: EditFormProps) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Input
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="Nom"
      />
      <Input
        type="date"
        value={birthDate}
        onChange={(e) => onBirthDateChange(e.target.value)}
      />
      <Input
        value={allergies}
        onChange={(e) => onAllergiesChange(e.target.value)}
        placeholder="Allergies (séparées par des virgules)"
      />
      <Input
        value={preferences}
        onChange={(e) => onPreferencesChange(e.target.value)}
        placeholder="Préférences (séparées par des virgules)"
      />
    </div>
    <div className="flex justify-end space-x-2">
      <Button variant="outline" onClick={onCancel}>
        Annuler
      </Button>
      <Button onClick={onSave}>
        <Save className="w-4 h-4 mr-2" />
        Enregistrer
      </Button>
    </div>
  </div>
);