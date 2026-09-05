import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Badge -- Bootstrap's badge/pill, extended with the semantic variants the app
 * needs (success/warning/info) and "soft" tinted variants that sit better on
 * cards than fully saturated blocks.
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        success:
          "border-transparent bg-success text-success-foreground hover:bg-success/80",
        warning:
          "border-transparent bg-warning text-warning-foreground hover:bg-warning/80",
        info: "border-transparent bg-info text-info-foreground hover:bg-info/80",
        outline: "border-border text-foreground",
        softSuccess: "border-success/30 bg-success/10 text-success",
        softWarning: "border-warning/40 bg-warning/10 text-warning",
        softInfo: "border-info/30 bg-info/10 text-info",
        softDestructive:
          "border-destructive/30 bg-destructive/10 text-destructive",
        softMuted: "border-border bg-muted text-muted-foreground",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0 text-[10px]",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

function Badge({ className, variant, size, dot = false, children, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 shrink-0 rounded-full bg-current"
        />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
