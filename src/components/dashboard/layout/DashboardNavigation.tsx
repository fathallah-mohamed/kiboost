import { Button } from '@/components/ui/button';

interface DashboardNavigationProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export const DashboardNavigation = ({ activeSection, setActiveSection }: DashboardNavigationProps) => {
  return (
    <div className="flex gap-2 mb-6">
      <Button
        variant={activeSection === 'overview' ? 'default' : 'outline'}
        onClick={() => setActiveSection('overview')}
      >
        Vue d'ensemble
      </Button>
      <Button
        variant={activeSection === 'children' ? 'default' : 'outline'}
        onClick={() => setActiveSection('children')}
      >
        Profils enfants
      </Button>
      <Button
        variant={activeSection === 'recipes' ? 'default' : 'outline'}
        onClick={() => setActiveSection('recipes')}
      >
        Recettes
      </Button>
      <Button
        variant={activeSection === 'planner' ? 'default' : 'outline'}
        onClick={() => setActiveSection('planner')}
      >
        Planificateur
      </Button>
    </div>
  );
};