import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * StatCard -- the "card with a big number" pattern from Bootstrap dashboard
 * examples. The value is rendered with tabular figures so a changing count does
 * not shift the layout.
 */
export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "default",
  className,
  ...props
}) {
  const tones = {
    default: "text-foreground",
    success: "text-success",
    warning: "text-warning",
    info: "text-info",
    destructive: "text-destructive",
  };

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-4 shadow-sm",
        className,
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p
            className={cn(
              "mt-1 font-display text-2xl font-bold tabular-nums",
              tones[tone] ?? tones.default,
            )}
          >
            {value}
          </p>
          {hint && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{hint}</p>
          )}
        </div>
        {icon && (
          <span className="shrink-0 rounded-md bg-muted p-2 text-muted-foreground">
            {icon}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * EmptyState -- a centred icon/title/description/action block for empty lists
 * and zero-result filters, so a table never renders as a bare header row.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-14 text-center",
        className,
      )}
      {...props}
    >
      {icon && (
        <span className="rounded-full bg-muted p-3 text-muted-foreground">
          {icon}
        </span>
      )}
      <p className="font-display text-base font-semibold text-foreground">
        {title}
      </p>
      {description && (
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action}
    </div>
  );
}
