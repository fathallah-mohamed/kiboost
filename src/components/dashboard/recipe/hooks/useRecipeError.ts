import { useState } from 'react';
import { toast } from 'sonner';

export const useRecipeError = () => {
  const [error, setError] = useState<string | null>(null);

  const handleError = (error: unknown, customMessage?: string) => {
    console.error('Recipe generation error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const displayMessage = customMessage || errorMessage;
    setError(displayMessage);
    toast.error(displayMessage);
    throw error;
  };

  return {
    error,
    setError,
    handleError
  };
};