import { useState } from 'react';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

interface DashboardLayoutProps {
  session: Session;
  children: React.ReactNode;
}

export const DashboardLayout = ({ session, children }: DashboardLayoutProps) => {
  const [currentTab, setCurrentTab] = useState('profiles');
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt sur Kiboost !",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la déconnexion.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onSignOut={handleSignOut}
      />
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
};