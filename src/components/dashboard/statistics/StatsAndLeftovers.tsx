import { Card } from '@/components/ui/card';
import { BackToDashboard } from '../BackToDashboard';

interface StatsAndLeftoversProps {
  onSectionChange?: (section: string) => void;
}

export const StatsAndLeftovers = ({ onSectionChange }: StatsAndLeftoversProps) => {
  return (
    <div className="space-y-6">
      <BackToDashboard onBack={() => onSectionChange?.('overview')} />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold">Statistiques et restes</h2>
      </div>

      <Card className="p-4">
        <p>Fonctionnalité en cours de développement...</p>
      </Card>
    </div>
  );
};