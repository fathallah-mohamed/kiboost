import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Calendar, 
  ChefHat, 
  User, 
  ShoppingCart, 
  Heart,
  CalendarRange,
  RefreshCw
} from 'lucide-react';

interface QuickActionsProps {
  onSectionChange: (section: string) => void;
}

export const QuickActions = ({ onSectionChange }: QuickActionsProps) => {
  const actionCategories = [
    {
      title: "Planification",
      color: "bg-primary/10",
      actions: [
        {
          label: 'Générer des recettes',
          icon: ChefHat,
          onClick: () => onSectionChange('recipes'),
          variant: 'default' as const
        },
        {
          label: 'Ajouter au planificateur',
          icon: Calendar,
          onClick: () => onSectionChange('planner'),
          variant: 'outline' as const
        }
      ]
    },
    {
      title: "Suivi",
      color: "bg-secondary/10",
      actions: [
        {
          label: 'Voir le planning',
          icon: CalendarRange,
          onClick: () => onSectionChange('view-planner'),
          variant: 'outline' as const
        },
        {
          label: 'Liste de courses',
          icon: ShoppingCart,
          onClick: () => onSectionChange('shopping'),
          variant: 'outline' as const
        },
        {
          label: 'Mes favoris',
          icon: Heart,
          onClick: () => onSectionChange('favorites'),
          variant: 'outline' as const
        }
      ]
    },
    {
      title: "Gestion",
      color: "bg-accent/10",
      actions: [
        {
          label: 'Profils enfants',
          icon: User,
          onClick: () => onSectionChange('children'),
          variant: 'outline' as const
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Actions rapides</h3>
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={() => onSectionChange('planner')}
        >
          <RefreshCw className="w-4 h-4" />
          Tout mettre à jour
        </Button>
      </div>

      <div className="grid gap-6">
        {actionCategories.map((category, index) => (
          <Card key={index} className={`p-6 ${category.color}`}>
            <h4 className="font-medium mb-4">{category.title}</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {category.actions.map((action, actionIndex) => (
                <Button
                  key={actionIndex}
                  variant={action.variant}
                  className="flex flex-col gap-2 h-auto py-4"
                  onClick={action.onClick}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-sm text-center">{action.label}</span>
                </Button>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};