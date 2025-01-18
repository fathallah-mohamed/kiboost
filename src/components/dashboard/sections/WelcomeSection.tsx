import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Bell } from 'lucide-react';

interface WelcomeSectionProps {
  userId: string;
}

export const WelcomeSection = ({ userId }: WelcomeSectionProps) => {
  const [userName, setUserName] = useState<string>('');
  const [notifications, setNotifications] = useState<string[]>([]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: children } = await supabase
        .from('children_profiles')
        .select('name')
        .eq('profile_id', userId);

      if (children && children.length > 0) {
        setNotifications([
          `Vous n'avez pas encore planifié vos repas pour cette semaine.`,
          `Ajoutez une activité pour ${children[0].name} dès maintenant !`
        ]);
      }
    };

    fetchUserProfile();
  }, [userId]);

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          Bonjour {userName || 'parent Kiboost'} !
        </h2>
        <Bell className="text-primary w-6 h-6" />
      </div>
      
      <div className="space-y-2">
        {notifications.map((notification, index) => (
          <div 
            key={index}
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <span className="w-2 h-2 rounded-full bg-primary" />
            {notification}
          </div>
        ))}
      </div>
    </Card>
  );
};