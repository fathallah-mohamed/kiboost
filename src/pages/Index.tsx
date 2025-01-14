import { useEffect, useState } from 'react';
import { AuthForm } from '@/components/auth/AuthForm';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Utensils, Calendar, ShoppingCart } from "lucide-react";
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
    // Get initial session
    const initializeSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error fetching session:', error);
          toast({
            variant: "destructive",
            title: "Erreur d'authentification",
            description: "Une erreur est survenue lors de la récupération de votre session.",
          });
          // Clear any invalid session data
          await supabase.auth.signOut();
          setSession(null);
        } else {
          setSession(currentSession);
        }
      } catch (error) {
        console.error('Error in session initialization:', error);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    initializeSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      console.log('Auth state changed:', _event);
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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold mb-6 text-primary">
          Kiboost
          <span className="text-accent">.</span>
        </h1>
        <p className="text-2xl mb-8 text-gray-600 max-w-2xl mx-auto">
          Des petits-déjeuners sains et amusants pour vos enfants, générés avec amour par l'IA
        </p>
        <AuthForm />
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<Heart className="w-8 h-8 text-primary" />}
            title="Recettes personnalisées"
            description="Des recettes adaptées aux goûts et besoins de vos enfants"
          />
          <FeatureCard
            icon={<Utensils className="w-8 h-8 text-primary" />}
            title="Nutrition équilibrée"
            description="Des petits-déjeuners nutritifs pour bien commencer la journée"
          />
          <FeatureCard
            icon={<Calendar className="w-8 h-8 text-primary" />}
            title="Planification facile"
            description="Planifiez la semaine en quelques clics"
          />
          <FeatureCard
            icon={<ShoppingCart className="w-8 h-8 text-primary" />}
            title="Liste de courses"
            description="Générez automatiquement votre liste de courses"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-secondary/50 py-20 mt-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Prêt à révolutionner les petits-déjeuners ?</h2>
          <p className="text-xl mb-8 text-gray-600 max-w-2xl mx-auto">
            Rejoignez des milliers de parents qui font confiance à Kiboost pour les petits-déjeuners de leurs enfants.
          </p>
          <Button asChild className="bg-accent hover:bg-accent/90 text-white rounded-full px-8 py-6 text-lg">
            <Link to="/signup">Essayer gratuitement</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <Card className="p-6 text-center hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm">
    <div className="mb-4 flex justify-center">{icon}</div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </Card>
);

export default Index;