import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { cva } from "class-variance-authority";

const stepIconVariants = cva(
  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
  {
    variants: {
      status: {
        completed: "bg-green-100 text-green-600",
        current: "bg-orange-100 text-orange-600",
        upcoming: "bg-gray-100 text-gray-400",
      },
    },
    defaultVariants: {
      status: "upcoming",
    },
  }
);

const stepContentVariants = cva(
  "ml-4 flex-1 transition-all duration-300",
  {
    variants: {
      status: {
        completed: "opacity-75",
        current: "opacity-100",
        upcoming: "opacity-50",
      },
    },
    defaultVariants: {
      status: "upcoming",
    },
  }
);

export type StepStatus = "completed" | "current" | "upcoming";

interface TimelineStepProps {
  icon: LucideIcon;
  title: string;
  description: string;
  status: StepStatus;
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
  actionLabel,
  onAction,
  isLast,
  disabled,
}: TimelineStepProps) => {
  const statusLabels = {
    completed: "✓ Terminé",
    current: "⚠ En cours",
    upcoming: "○ Non commencé",
  };

  const statusColors = {
    completed: "text-green-600",
    current: "text-orange-600",
    upcoming: "text-gray-400",
  };

  return (
    <div className="relative flex">
      {/* Vertical line */}
      {!isLast && (
        <div className="absolute left-5 top-10 bottom-0 w-0.5 -ml-px">
          <div className="h-full">
            <div
              className={cn(
                "h-full w-full transition-all duration-500",
                status === "completed"
                  ? "bg-green-500"
                  : status === "current"
                  ? "bg-gradient-to-b from-green-500 to-gray-200"
                  : "bg-gray-200"
              )}
            />
          </div>
        </div>
      )}

      {/* Icon */}
      <div className={stepIconVariants({ status })}>
        <Icon className="w-5 h-5" />
      </div>

      {/* Content */}
      <div className={cn(stepContentVariants({ status }), "mb-8 ml-6")}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
            <span className={cn("text-sm mt-2 block", statusColors[status])}>
              {statusLabels[status]}
            </span>
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