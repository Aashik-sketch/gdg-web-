"use client";

import * as React from "react";
import { cva } from "class-variance-authority";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  TriangleAlert,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Alert -- the equivalent of a Bootstrap alert, built on the project's own
 * design tokens so it themes with the rest of the app and works in dark mode.
 *
 * Variants use a tinted background (`/10`) with a solid border and icon in the
 * same hue, which reads as an alert without the heavy saturated block Bootstrap
 * uses. `dismissible` adds a close button; `role` defaults to "alert" so the
 * message is announced.
 */
const alertVariants = cva(
  "relative flex w-full gap-3 rounded-lg border p-4 text-sm",
  {
    variants: {
      variant: {
        default: "border-border bg-muted/50 text-foreground",
        info: "border-info/30 bg-info/10 text-foreground",
        success: "border-success/30 bg-success/10 text-foreground",
        warning: "border-warning/40 bg-warning/10 text-foreground",
        destructive: "border-destructive/30 bg-destructive/10 text-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

const ICONS = {
  default: Info,
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  destructive: AlertCircle,
};

const ICON_TONE = {
  default: "text-muted-foreground",
  info: "text-info",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
};

const Alert = React.forwardRef(
  (
    {
      className,
      variant = "default",
      icon,
      dismissible = false,
      onDismiss,
      children,
      ...props
    },
    ref,
  ) => {
    const Icon = ICONS[variant] ?? Info;

    return (
      <div
        ref={ref}
        role={variant === "destructive" ? "alert" : "status"}
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        {icon !== null && (
          <span className={cn("mt-0.5 shrink-0", ICON_TONE[variant])}>
            {icon ?? <Icon className="h-4 w-4" aria-hidden="true" />}
          </span>
        )}
        <div className="min-w-0 flex-1">{children}</div>
        {dismissible && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss"
            className="-mr-1 -mt-1 shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    );
  },
);
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("font-medium leading-snug text-foreground", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground [&_p]:leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription, alertVariants };
