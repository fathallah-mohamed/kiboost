import { Loader2 } from "lucide-react";

export const LoadingOverlay = () => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white p-8 rounded-lg flex flex-col items-center gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-lg font-medium">Génération des recettes en cours...</p>
      <p className="text-sm text-muted-foreground">Veuillez patienter, cela peut prendre quelques instants</p>
    </div>
  </div>
);