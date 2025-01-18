import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, BookOpen, Calendar, ShoppingCart, BarChart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardOverview = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow">
        <div className="flex items-center gap-4">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h3 className="text-lg font-semibold">Profils enfants</h3>
            <p className="text-sm text-muted-foreground">2 profils ajoutés</p>
          </div>
        </div>
        <Button className="w-full" asChild>
          <Link to="#profiles">Voir tous les profils</Link>
        </Button>
      </Card>

      <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow">
        <div className="flex items-center gap-4">
          <BookOpen className="h-8 w-8 text-primary" />
          <div>
            <h3 className="text-lg font-semibold">Recettes</h3>
            <p className="text-sm text-muted-foreground">3 nouvelles recettes</p>
          </div>
        </div>
        <Button className="w-full" asChild>
          <Link to="#recipes">Rechercher une recette</Link>
        </Button>
      </Card>

      <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow">
        <div className="flex items-center gap-4">
          <Calendar className="h-8 w-8 text-primary" />
          <div>
            <h3 className="text-lg font-semibold">Planificateur</h3>
            <p className="text-sm text-muted-foreground">5 repas planifiés</p>
          </div>
        </div>
        <Button className="w-full" asChild>
          <Link to="#planner">Voir le plan complet</Link>
        </Button>
      </Card>

      <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow">
        <div className="flex items-center gap-4">
          <ShoppingCart className="h-8 w-8 text-primary" />
          <div>
            <h3 className="text-lg font-semibold">Liste de courses</h3>
            <p className="text-sm text-muted-foreground">8 articles à acheter</p>
          </div>
        </div>
        <Button className="w-full" asChild>
          <Link to="#shopping">Générer une liste</Link>
        </Button>
      </Card>

      <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow">
        <div className="flex items-center gap-4">
          <BarChart className="h-8 w-8 text-primary" />
          <div>
            <h3 className="text-lg font-semibold">Statistiques</h3>
            <p className="text-sm text-muted-foreground">10 repas ce mois</p>
          </div>
        </div>
        <Button className="w-full" asChild>
          <Link to="#stats">Voir les statistiques</Link>
        </Button>
      </Card>
    </div>
  );
};