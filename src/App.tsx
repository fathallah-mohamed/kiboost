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

const queryClient = new QueryClient();

const AppRoutes = () => {
  const session = useSession();

  return (
    <Routes>
      <Route 
        path="/" 
        element={session ? <Navigate to="/dashboard" /> : <Index />} 
      />
      <Route path="/login" element={<Auth />} />
      <Route path="/signup" element={<Auth />} />
      <Route 
        path="/dashboard" 
        element={session ? <Dashboard session={session} /> : <Navigate to="/login" />} 
      />
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