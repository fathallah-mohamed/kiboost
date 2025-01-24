import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRecipeGeneration } from './useRecipeGeneration';
import { useSession } from '@supabase/auth-helpers-react';
import { BackToDashboard } from '../BackToDashboard';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, ChefHat } from 'lucide-react';

export const RecipeGeneratorPage = () => {
  const [loading, setLoading] = useState(false);
  const session = useSession();
  const navigate = useNavigate();
  const { generateRecipes } = useRecipeGeneration();

  const handleGenerateRecipes = async () => {
    try {
      setLoading(true);
      // Logique de génération de recettes ici
      toast.success("Recettes générées avec succès !");
      navigate('/dashboard/recipes');
    } catch (error) {
      console.error('Error generating recipes:', error);
      toast.error("Une erreur est survenue lors de la génération des recettes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <BackToDashboard onBack={() => navigate('/dashboard')} />
      
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Générateur de Recettes</h2>
            <p className="text-muted-foreground mt-2">
              Générez des recettes personnalisées adaptées à vos besoins
            </p>
          </div>

          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={handleGenerateRecipes}
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ChefHat className="w-5 h-5" />
              )}
              Générer des recettes
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};