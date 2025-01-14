import { calculateAge } from '../utils/age-calculator';

interface AgeDisplayProps {
  birthDate: string;
}

export const AgeDisplay = ({ birthDate }: AgeDisplayProps) => {
  const age = calculateAge(birthDate);
  
  return (
    <p className="text-gray-600">
      Âge: {age.years} ans{age.months > 0 && `, ${age.months} mois`}{age.days > 0 && `, ${age.days} jours`}
    </p>
  );
};