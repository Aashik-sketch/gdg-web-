import React from "react";
import { Loader2 } from "lucide-react";

/**
 * Accessible loading spinner.
 *
 * `role="status"` announces the region to assistive technology, and the
 * visually hidden label gives it an accessible name. The icon itself is hidden
 * from AT since the label already conveys the meaning.
 */
export default function GDGLoader({ label = "Loading" }) {
  return (
    <div
      role="status"
      className="flex min-h-[8rem] w-full items-center justify-center gap-3 text-muted-foreground"
    >
      <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
