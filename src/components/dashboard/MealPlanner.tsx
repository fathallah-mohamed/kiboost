import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Calendar } from 'lucide-react';

interface MealPlannerProps {
  userId: string;
}

export const MealPlanner = ({ userId }: MealPlannerProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Planificateur de repas</h2>
      <p>Fonctionnalité en cours de développement...</p>
    </div>
  );
};