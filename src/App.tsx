import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabase } from '@/integrations/supabase/client';
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import { Dashboard } from "./components/dashboard/Dashboard";
import { useSession } from "@supabase/auth-helpers-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { RecipeGenerator } from "./components/dashboard/RecipeGenerator";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const session = useSession();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token has been refreshed');
      }
      if (event === 'SIGNED_OUT') {
        toast.error("Votre session a expiré. Veuillez vous reconnecter.");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={session ? <Navigate to="/dashboard" /> : <Auth />} />
      <Route path="/signup" element={session ? <Navigate to="/dashboard" /> : <Auth />} />
      <Route path="/dashboard/*" element={session ? <Dashboard session={session} /> : <Navigate to="/login" />}>
        <Route path="recipes" element={<RecipeGenerator onSectionChange={() => {}} />} />
      </Route>
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionContextProvider supabaseClient={supabase}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </SessionContextProvider>
    </QueryClientProvider>
  );
};

export default App;