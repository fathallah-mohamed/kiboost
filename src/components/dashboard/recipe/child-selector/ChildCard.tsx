import { ChildProfile } from '../../types';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

interface ChildCardProps {
  child: ChildProfile;
  isSelected: boolean;
  onToggle: (child: ChildProfile) => void;
}

export const ChildCard = ({ child, isSelected, onToggle }: ChildCardProps) => {
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

  return (
    <Card
      className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
        isSelected ? 'ring-1 ring-primary' : ''
      }`}
      onClick={() => onToggle(child)}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h4 className="text-lg font-medium">{child.name}</h4>
          <p className="text-sm text-gray-600">{calculateAge(child.birth_date)} ans</p>
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
          checked={isSelected}
          className="mt-1"
        />
      </div>
    </Card>
  );
};