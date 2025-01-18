import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ShoppingCart } from 'lucide-react';
import { BackToDashboard } from './BackToDashboard';

interface ShoppingListProps {
  userId: string;
  onSectionChange?: (section: string) => void;
}

export const ShoppingList = ({ userId, onSectionChange }: ShoppingListProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  return (
    <div className="space-y-6">
      <BackToDashboard onBack={() => onSectionChange?.('overview')} />
      <h2 className="text-2xl font-bold">Liste de courses</h2>
      <p>Fonctionnalité en cours de développement...</p>
    </div>
  );
};