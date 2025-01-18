import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AddChildFormProps {
  userId: string;
  onChildAdded: () => void;
  existingChildrenCount: number;
}

export const AddChildForm = ({ userId, onChildAdded, existingChildrenCount }: AddChildFormProps) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [allergies, setAllergies] = useState('');
  const [preferences, setPreferences] = useState('');
  const { toast } = useToast();
  
  const MAX_FREE_PROFILES = 2;
  const isMaxProfilesReached = existingChildrenCount >= MAX_FREE_PROFILES;

  const commonAllergies = ['gluten', 'lactose', 'arachides', 'fruits de mer', 'œufs'];
  const commonPreferences = ['végétarien', 'sans porc', 'fruits', 'légumes', 'pâtes'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isMaxProfilesReached) {
      toast({
        variant: "destructive",
        title: "Limite atteinte",
        description: "Version Premium requise pour ajouter plus de profils.",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('children_profiles')
        .insert([
          {
            profile_id: userId,
            name,
            birth_date: birthDate,
            allergies: allergies.split(',').map(a => a.trim()).filter(Boolean),
            preferences: preferences.split(',').map(p => p.trim()).filter(Boolean),
          }
        ]);

      if (error) throw error;

      setName('');
      setBirthDate('');
      setAllergies('');
      setPreferences('');
      setStep(1);
      onChildAdded();

      toast({
        title: "Profil créé",
        description: `Le profil de ${name} a été créé avec succès.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer le profil.",
      });
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <Input
              placeholder="Nom"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              required
            />
            <Button 
              type="button" 
              onClick={() => setStep(2)}
              disabled={!name || !birthDate}
            >
              Suivant
            </Button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Allergies courantes :</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {commonAllergies.map((allergy) => (
                  <Badge
                    key={allergy}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/20"
                    onClick={() => {
                      const current = allergies.split(',').map(a => a.trim()).filter(Boolean);
                      const updated = current.includes(allergy)
                        ? current.filter(a => a !== allergy)
                        : [...current, allergy];
                      setAllergies(updated.join(', '));
                    }}
                  >
                    {allergy}
                  </Badge>
                ))}
              </div>
              <Input
                placeholder="Autres allergies (séparées par des virgules)"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
              />
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Retour
              </Button>
              <Button onClick={() => setStep(3)}>
                Suivant
              </Button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Préférences courantes :</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {commonPreferences.map((pref) => (
                  <Badge
                    key={pref}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/20"
                    onClick={() => {
                      const current = preferences.split(',').map(p => p.trim()).filter(Boolean);
                      const updated = current.includes(pref)
                        ? current.filter(p => p !== pref)
                        : [...current, pref];
                      setPreferences(updated.join(', '));
                    }}
                  >
                    {pref}
                  </Badge>
                ))}
              </div>
              <Input
                placeholder="Autres préférences (séparées par des virgules)"
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
              />
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                Retour
              </Button>
              <Button type="submit">
                Créer le profil
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Ajouter un profil enfant</CardTitle>
          <CardDescription>
            Étape {step}/3 : {step === 1 ? "Informations de base" : step === 2 ? "Allergies" : "Préférences"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderStep()}
        </CardContent>
        {isMaxProfilesReached && (
          <CardFooter className="bg-muted/50 flex gap-2 text-sm text-muted-foreground">
            <AlertCircle className="w-4 h-4" />
            <span>
              Limite atteinte (2 profils). Débloquez des profils illimités avec Kiboost Premium (bientôt disponible).
            </span>
          </CardFooter>
        )}
      </Card>
    </form>
  );
};