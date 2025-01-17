import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { AuthError } from '@supabase/supabase-js';
import { Alert, AlertDescription } from "@/components/ui/alert";

export const AuthForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast({
          title: "Vérifiez votre email",
          description: "Un lien de confirmation vous a été envoyé.",
        });
      } else {
        console.log('Tentative de connexion avec:', email);
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast({
          title: "Connexion réussie",
          description: "Bienvenue sur Kiboost !",
        });
      }
    } catch (error: unknown) {
      console.error('Auth error:', error);
      const authError = error as AuthError;
      let errorMessage = "Une erreur est survenue.";
      
      if (authError.message === 'Invalid login credentials') {
        errorMessage = "Email ou mot de passe incorrect.";
      } else if (authError.message.includes('Email not confirmed')) {
        errorMessage = "Veuillez confirmer votre email avant de vous connecter.";
      }

      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: errorMessage,
      });

      if (authError.message.includes('refresh_token')) {
        await supabase.auth.signOut();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 w-full max-w-md mx-auto">
      <form onSubmit={handleAuth} className="space-y-4">
        <h2 className="text-2xl font-bold text-center mb-6">
          {isSignUp ? 'Créer un compte' : 'Se connecter'}
        </h2>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="space-y-2">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Chargement...' : (isSignUp ? 'S\'inscrire' : 'Se connecter')}
        </Button>
        <p className="text-center text-sm">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-primary hover:underline"
          >
            {isSignUp ? 'Déjà un compte ? Se connecter' : 'Pas de compte ? S\'inscrire'}
          </button>
        </p>
      </form>
    </Card>
  );
};