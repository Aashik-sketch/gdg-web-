import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Spinner -- Bootstrap's spinner-border. Announced via role="status" with a
 * visually hidden label so it is not a silent element for screen readers.
 */
const SIZES = {
  sm: "h-4 w-4",
  default: "h-6 w-6",
  lg: "h-10 w-10",
};

export function Spinner({ size = "default", label = "Loading", className, ...props }) {
  return (
    <span role="status" className={cn("inline-flex items-center", className)} {...props}>
      <Loader2
        className={cn("animate-spin text-muted-foreground", SIZES[size] ?? SIZES.default)}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}

/**
 * Skeleton -- Bootstrap 5 has no equivalent; this is the placeholder-glow
 * pattern. Purely decorative, so it is hidden from assistive tech and the
 * surrounding container should carry aria-busy.
 */
export function Skeleton({ className, ...props }) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}
