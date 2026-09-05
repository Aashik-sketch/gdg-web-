import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Progress -- Bootstrap's progress bar as an accessible ARIA progressbar.
 *
 * `value` and `max` are clamped so a caller cannot render an overflowing bar.
 * When a `label` is supplied it is used as the accessible name; otherwise the
 * caller must pass aria-label or aria-labelledby.
 */
const Progress = React.forwardRef(
  (
    { className, value = 0, max = 100, label, tone = "primary", showValue = false, ...props },
    ref,
  ) => {
    const safeMax = max > 0 ? max : 100;
    const clamped = Math.min(Math.max(Number(value) || 0, 0), safeMax);
    const percent = Math.round((clamped / safeMax) * 100);

    const tones = {
      primary: "bg-primary",
      success: "bg-success",
      warning: "bg-warning",
      info: "bg-info",
      destructive: "bg-destructive",
    };

    return (
      <div className={cn("w-full", className)}>
        {(label || showValue) && (
          <div className="mb-1.5 flex items-baseline justify-between gap-2">
            {label && (
              <span className="text-xs font-medium text-muted-foreground">
                {label}
              </span>
            )}
            {showValue && (
              <span className="text-xs font-semibold tabular-nums text-foreground">
                {clamped}/{safeMax}
              </span>
            )}
          </div>
        )}
        <div
          ref={ref}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={safeMax}
          aria-label={label || props["aria-label"]}
          className="h-2 w-full overflow-hidden rounded-full bg-muted"
          {...props}
        >
          <div
            className={cn(
              "h-full rounded-full transition-[width] duration-500 ease-out",
              tones[tone] ?? tones.primary,
            )}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    );
  },
);
Progress.displayName = "Progress";

export { Progress };
