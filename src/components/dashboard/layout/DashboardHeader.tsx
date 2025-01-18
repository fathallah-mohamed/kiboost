import { Link } from 'react-router-dom';
import { HomeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardHeaderProps {
  handleLogout: () => Promise<void>;
}

export const DashboardHeader = ({ handleLogout }: DashboardHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/" className="flex items-center gap-2">
            <HomeIcon className="w-4 h-4" />
            Retour à l'accueil
          </Link>
        </Button>
      </div>
      <Button variant="outline" onClick={handleLogout}>
        Se déconnecter
      </Button>
    </div>
  );
};