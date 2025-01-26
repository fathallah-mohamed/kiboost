export type StepStatus = "not_started" | "in_progress" | "completed";

export interface StepState {
  status: StepStatus;
  message?: string;
}

export interface GenerationStep extends StepState {
  hasSelectedChild: boolean;
  hasGeneratedRecipes: boolean;
  hasInteractedWithRecipes: boolean;
}