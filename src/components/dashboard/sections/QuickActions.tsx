import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Calendar, 
  ChefHat, 
  User, 
  ShoppingCart, 
  Heart,
  CalendarRange,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

interface QuickActionsProps {
  onSectionChange: (section: string) => void;
}

export const QuickActions = ({ onSectionChange }: QuickActionsProps) => {
  const actionCategories = [
    {
      title: "Planification",
      color: "bg-primary/10",
      description: "Générez des recettes et planifiez vos repas",
      actions: [
        {
          label: 'Générer des recettes',
          icon: ChefHat,
          onClick: () => onSectionChange('recipes'),
          variant: 'default' as const,
          description: 'Créez des recettes adaptées'
        },
        {
          label: 'Planificateur',
          icon: Calendar,
          onClick: () => onSectionChange('planner'),
          variant: 'outline' as const,
          description: 'Organisez votre semaine'
        }
      ]
    },
    {
      title: "Suivi",
      color: "bg-secondary/10",
      description: "Suivez et gérez vos plannings",
      actions: [
        {
          label: 'Voir le planning',
          icon: CalendarRange,
          onClick: () => onSectionChange('view-planner'),
          variant: 'outline' as const,
          description: 'Consultez votre planning'
        },
        {
          label: 'Liste de courses',
          icon: ShoppingCart,
          onClick: () => onSectionChange('shopping'),
          variant: 'outline' as const,
          description: 'Gérez vos courses'
        },
        {
          label: 'Mes favoris',
          icon: Heart,
          onClick: () => onSectionChange('favorites'),
          variant: 'outline' as const,
          description: 'Recettes favorites'
        }
      ]
    },
    {
      title: "Gestion",
      color: "bg-accent/10",
      description: "Gérez les profils et préférences",
      actions: [
        {
          label: 'Profils enfants',
          icon: User,
          onClick: () => onSectionChange('children'),
          variant: 'outline' as const,
          description: 'Gérez les profils'
        }
      ]
    }
  ];

  const handleQuickUpdate = () => {
    toast.success("Mise à jour rapide lancée", {
      description: "Vos données sont en cours de mise à jour..."
    });
    onSectionChange('planner');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Actions rapides
          </h3>
          <p className="text-sm text-muted-foreground">
            Accédez rapidement à vos fonctionnalités préférées
          </p>
        </div>
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={handleQuickUpdate}
        >
          <RefreshCw className="w-4 h-4" />
          Tout mettre à jour
        </Button>
      </div>

      <div className="grid gap-6">
        {actionCategories.map((category, index) => (
          <Card key={index} className={`p-6 ${category.color}`}>
            <div className="mb-4">
              <h4 className="font-medium">{category.title}</h4>
              <p className="text-sm text-muted-foreground">{category.description}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.actions.map((action, actionIndex) => (
                <Button
                  key={actionIndex}
                  variant={action.variant}
                  className="flex flex-col gap-2 h-auto py-4 group hover:scale-105 transition-transform"
                  onClick={action.onClick}
                >
                  <action.icon className="w-5 h-5 group-hover:text-primary transition-colors" />
                  <span className="text-sm text-center font-medium">{action.label}</span>
                  <span className="text-xs text-muted-foreground text-center">
                    {action.description}
                  </span>
                </Button>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};