import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ChildProfile, Recipe } from '../../types';
import { format, addDays, startOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';

export const useQuickPlan = (userId: string) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const checkRequirements = async () => {
    try {
      const { data, error } = await supabase
        .rpc('check_meal_plan_requirements', { profile_id: userId });

      if (error) throw error;

      if (data && data.length > 0) {
        const { can_generate, message } = data[0];
        return { can_generate, message };
      }

      return { can_generate: false, message: 'Une erreur est survenue' };
    } catch (error) {
      console.error('Error checking requirements:', error);
      return { can_generate: false, message: 'Une erreur est survenue' };
    }
  };

  const generateQuickPlan = async () => {
    setLoading(true);
    try {
      // Check requirements first
      const { can_generate, message } = await checkRequirements();
      
      if (!can_generate) {
        toast.error("Impossible de générer le planning", {
          description: message,
          action: {
            label: "Configurer les profils",
            onClick: () => navigate('/dashboard/children')
          }
        });
        return;
      }

      // Fetch children profiles
      const { data: children, error: childrenError } = await supabase
        .from('children_profiles')
        .select('*')
        .eq('profile_id', userId);

      if (childrenError) throw childrenError;

      if (!children || children.length === 0) {
        toast.error("Aucun profil enfant trouvé");
        return;
      }

      // Fetch suitable recipes
      const { data: recipes, error: recipesError } = await supabase
        .from('recipes')
        .select('*')
        .eq('is_generated', true)
        .limit(50);

      if (recipesError) throw recipesError;

      if (!recipes || recipes.length === 0) {
        toast.error("Aucune recette disponible");
        return;
      }

      // Generate a week of meal plans
      const startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
      const mealPlans = [];

      for (const child of children) {
        for (let i = 0; i < 7; i++) {
          const date = addDays(startDate, i);
          const randomRecipe = recipes[Math.floor(Math.random() * recipes.length)];
          
          mealPlans.push({
            profile_id: userId,
            child_id: child.id,
            recipe_id: randomRecipe.id,
            date: format(date, 'yyyy-MM-dd'),
            is_auto_generated: true,
            meal_time: 'dinner'
          });
        }
      }

      // Insert meal plans
      const { error: insertError } = await supabase
        .from('meal_plans')
        .insert(mealPlans);

      if (insertError) throw insertError;

      toast.success("Planning généré avec succès !", {
        description: "Votre planning de la semaine est prêt.",
        action: {
          label: "Voir le planning",
          onClick: () => navigate('/dashboard/planner')
        }
      });

    } catch (error) {
      console.error('Error generating quick plan:', error);
      toast.error("Erreur lors de la génération du planning", {
        description: "Une erreur est survenue, veuillez réessayer."
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    generateQuickPlan,
    loading
  };
};