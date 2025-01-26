import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { cva } from "class-variance-authority";
import { StepStatus } from "../../types/steps";

const stepIconVariants = cva(
  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
  {
    variants: {
      status: {
        completed: "bg-green-100 text-green-600",
        in_progress: "bg-orange-100 text-orange-600",
        not_started: "bg-gray-100 text-gray-400",
      },
    },
    defaultVariants: {
      status: "not_started",
    },
  }
);

const stepContentVariants = cva(
  "ml-4 flex-1 transition-all duration-300",
  {
    variants: {
      status: {
        completed: "opacity-75",
        in_progress: "opacity-100",
        not_started: "opacity-50",
      },
    },
    defaultVariants: {
      status: "not_started",
    },
  }
);

interface TimelineStepProps {
  icon: LucideIcon;
  title: string;
  description: string;
  status: StepStatus;
  message?: string;
  actionLabel: string;
  onAction: () => void;
  isLast?: boolean;
  disabled?: boolean;
}

export const TimelineStep = ({
  icon: Icon,
  title,
  description,
  status,
  message,
  actionLabel,
  onAction,
  isLast,
  disabled,
}: TimelineStepProps) => {
  const statusLabels = {
    completed: "✓ Terminé",
    in_progress: "⚠ En cours",
    not_started: "○ Non commencé",
  };

  const statusColors = {
    completed: "text-green-600",
    in_progress: "text-orange-600",
    not_started: "text-gray-400",
  };

  return (
    <div className="relative flex">
      {!isLast && (
        <div className="absolute left-5 top-10 bottom-0 w-0.5 -ml-px">
          <div className="h-full">
            <div
              className={cn(
                "h-full w-full transition-all duration-500",
                status === "completed"
                  ? "bg-green-500"
                  : status === "in_progress"
                  ? "bg-gradient-to-b from-green-500 to-gray-200"
                  : "bg-gray-200"
              )}
            />
          </div>
        </div>
      )}

      <div className={stepIconVariants({ status })}>
        <Icon className="w-5 h-5" />
      </div>

      <div className={cn(stepContentVariants({ status }), "mb-8 ml-6")}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
            <span className={cn("text-sm mt-2 block", statusColors[status])}>
              {statusLabels[status]}
            </span>
            {message && (
              <p className="text-sm mt-1 text-red-500">{message}</p>
            )}
          </div>
          <Button
            onClick={onAction}
            disabled={disabled}
            variant={status === "completed" ? "outline" : "default"}
            className="whitespace-nowrap"
          >
            {actionLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};