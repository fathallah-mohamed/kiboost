import { useEffect, useState } from 'react';
import { AuthForm } from '@/components/auth/AuthForm';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Calendar, Users, ChevronRight, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Dashboard } from '@/components/dashboard/Dashboard';
import { Session } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const initializeSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Erreur lors de la récupération de la session:', error);
          toast({
            variant: "destructive",
            title: "Erreur d'authentification",
            description: "Une erreur est survenue lors de la récupération de votre session.",
          });
          await supabase.auth.signOut();
          setSession(null);
        } else {
          setSession(currentSession);
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de la session:', error);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    initializeSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      console.log('État d\'authentification modifié:', _event);
      if (_event === 'SIGNED_OUT') {
        setSession(null);
        navigate('/');
      } else if (_event === 'SIGNED_IN') {
        setSession(currentSession);
      } else if (_event === 'TOKEN_REFRESHED') {
        setSession(currentSession);
      } else if (_event === 'USER_UPDATED') {
        setSession(currentSession);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (session) {
    return <Dashboard session={session} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
          Simplifiez vos repas, vos courses et vos activités
          <span className="text-primary">.</span>
        </h1>
        <p className="text-2xl mb-8 text-muted-foreground max-w-2xl mx-auto">
          Tout en un seul endroit !
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <AuthForm />
          <Button variant="outline" size="lg" className="gap-2" asChild>
            <Link to="/demo">
              Explorer sans inscription
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Heart className="w-8 h-8 text-primary" />}
            title="Recettes personnalisées"
            description="Trouvez des idées adaptées à vos enfants"
            soon={false}
          />
          <FeatureCard
            icon={<Calendar className="w-8 h-8 text-primary" />}
            title="Planificateur"
            description="Organisez vos repas et gagnez du temps"
            soon={false}
          />
          <FeatureCard
            icon={<Users className="w-8 h-8 text-primary" />}
            title="Profils enfants"
            description="Suivez les besoins de chacun de vos enfants"
            soon={false}
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 py-20 mt-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Prêt à révolutionner vos repas ?</h2>
          <p className="text-xl mb-8 text-muted-foreground max-w-2xl mx-auto">
            Rejoignez des milliers de parents qui font confiance à Kiboost pour simplifier leur quotidien.
          </p>
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 py-6 text-lg">
            Commencer gratuitement
          </Button>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ 
  icon, 
  title, 
  description, 
  soon = false 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  soon?: boolean;
}) => (
  <Card className="p-6 text-center hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm relative overflow-hidden">
    {soon && (
      <div className="absolute top-2 right-2 flex items-center gap-1 text-xs font-medium text-primary">
        <Sparkles className="w-3 h-3" />
        Bientôt
      </div>
    )}
    <div className="mb-4 flex justify-center">{icon}</div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </Card>
);

export default Index;