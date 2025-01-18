import { useState } from 'react';
import { Session } from '@supabase/auth-helpers-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ChildProfile } from './types';
import { DashboardHeader } from './layout/DashboardHeader';
import { DashboardNavigation } from './layout/DashboardNavigation';
import { DashboardContent } from './layout/DashboardContent';

interface DashboardProps {
  session: Session;
}

export const Dashboard = ({ session }: DashboardProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(null);
  const [activeSection, setActiveSection] = useState<string>('overview');

  const handleLogout = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt sur Kiboost !",
      });
      navigate('/');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur lors de la déconnexion",
        description: "Une erreur est survenue, veuillez réessayer.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardHeader handleLogout={handleLogout} />
      <DashboardNavigation 
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
      <DashboardContent
        session={session}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        selectedChild={selectedChild}
        setSelectedChild={setSelectedChild}
      />
    </div>
  );
};