import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

export const PremiumTeaser = () => {
  return (
    <Card className="p-6 bg-gradient-to-r from-primary/5 to-primary/10">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Kiboost Premium
          </h3>
          <p className="text-sm text-muted-foreground">
            Débloquez plus avec Kiboost Premium : profils illimités, recettes exclusives, planification avancée.
          </p>
        </div>
        <Button variant="default" className="shrink-0">
          Découvrir Premium
        </Button>
      </div>
    </Card>
  );
};