import { useState } from 'react';
import { Session } from '@supabase/auth-helpers-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DashboardHeader } from './layout/DashboardHeader';
import { DashboardContent } from './layout/DashboardContent';
import { CategoriesGrid } from './categories/CategoriesGrid';

interface DashboardProps {
  session: Session;
}

export const Dashboard = ({ session }: DashboardProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('categories');

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
    <div className="min-h-screen bg-background">
      <DashboardHeader handleLogout={handleLogout} />
      {activeSection === 'categories' ? (
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold mb-6">Bienvenue sur Kiboost</h2>
          <CategoriesGrid onSectionChange={setActiveSection} />
        </div>
      ) : (
        <DashboardContent
          session={session}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />
      )}
    </div>
  );
};