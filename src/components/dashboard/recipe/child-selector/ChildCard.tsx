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
    
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();
    
    // Ajuster les mois si les jours sont négatifs
    if (days < 0) {
      months -= 1;
      // Ajouter les jours du mois précédent
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, birth.getDate());
      days += Math.floor((today.getTime() - lastMonth.getTime()) / (1000 * 60 * 60 * 24));
    }
    
    // Ajuster les années si les mois sont négatifs
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    
    return { years, months, days };
  };

  const age = calculateAge(child.birth_date);

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
          <p className="text-sm text-gray-600">
            {age.years} ans{age.months > 0 && `, ${age.months} mois`}{age.days > 0 && `, ${age.days} jours`}
          </p>
          <p className="text-sm text-gray-600">
            Allergies: {child.allergies?.length > 0 ? child.allergies.join(', ') : 'Aucune allergie connue'}
          </p>
          <p className="text-sm text-gray-600">
            Préférences: {child.preferences?.length > 0 ? child.preferences.join(', ') : 'Aucune préférence renseignée'}
          </p>
        </div>
        <Checkbox
          checked={isSelected}
          className="mt-1"
        />
      </div>
    </Card>
  );
};