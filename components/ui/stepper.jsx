import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Stepper -- a horizontal progress indicator for the application flow
 * (Select departments -> Complete application -> Submitted).
 *
 * Exposed to assistive tech as an ordered list where the active step carries
 * aria-current="step" and completed steps are labelled as such, rather than
 * relying on colour alone.
 *
 * @param {{label:string, description?:string}[]} steps
 * @param {number} current zero-based index of the active step
 */
export function Stepper({ steps = [], current = 0, className, ...props }) {
  if (!steps.length) return null;

  return (
    <nav aria-label="Progress" className={cn("w-full", className)} {...props}>
      <ol className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-0">
        {steps.map((step, index) => {
          const isComplete = index < current;
          const isActive = index === current;
          const isLast = index === steps.length - 1;

          return (
            <li
              key={step.label}
              className={cn("flex gap-3 sm:flex-1 sm:flex-col sm:gap-0")}
              aria-current={isActive ? "step" : undefined}
            >
              <div className="flex items-center gap-3 sm:gap-0">
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                    isComplete &&
                      "border-success bg-success text-success-foreground",
                    isActive && "border-primary bg-primary text-primary-foreground",
                    !isComplete &&
                      !isActive &&
                      "border-border bg-background text-muted-foreground",
                  )}
                >
                  {isComplete ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    index + 1
                  )}
                </span>

                {/* Connector: horizontal on sm+, hidden on mobile where the
                    steps stack vertically. */}
                {!isLast && (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "hidden h-0.5 flex-1 sm:block",
                      isComplete ? "bg-success" : "bg-border",
                    )}
                  />
                )}
              </div>

              <div className="min-w-0 sm:mt-2 sm:pr-4">
                <span
                  className={cn(
                    "block text-sm font-medium",
                    isActive || isComplete
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {step.label}
                  {isComplete && <span className="sr-only"> (completed)</span>}
                </span>
                {step.description && (
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {step.description}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
