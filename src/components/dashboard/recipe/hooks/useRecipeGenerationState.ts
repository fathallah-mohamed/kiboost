import { useState } from "react";
import { GenerationStep, StepStatus } from "../../types/steps";

export const useRecipeGenerationState = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stepState, setStepState] = useState<GenerationStep>({
    status: "not_started",
    hasSelectedChild: false,
    hasGeneratedRecipes: false,
    hasInteractedWithRecipes: false,
  });

  const updateStepState = (updates: Partial<GenerationStep>) => {
    setStepState(prev => {
      const newState = { ...prev, ...updates };
      let status: StepStatus = "not_started";
      
      if (newState.hasSelectedChild && newState.hasGeneratedRecipes) {
        status = "in_progress";
      }
      
      if (newState.hasSelectedChild && newState.hasGeneratedRecipes && newState.hasInteractedWithRecipes) {
        status = "completed";
      }
      
      return { ...newState, status };
    });
  };

  return {
    loading,
    setLoading,
    error,
    setError,
    stepState,
    updateStepState,
  };
};