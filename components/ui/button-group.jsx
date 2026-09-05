import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * ButtonGroup -- Bootstrap's .btn-group. Collapses the inner radii and removes
 * doubled borders so a row of buttons reads as one control.
 *
 * Exposed as role="group"; pass an aria-label describing what the group does.
 */
export function ButtonGroup({ className, children, ...props }) {
  return (
    <div
      role="group"
      className={cn(
        "inline-flex items-center [&>*:not(:first-child)]:ml-[-1px] [&>*:not(:first-child)]:rounded-l-none [&>*:not(:last-child)]:rounded-r-none [&>*]:relative [&>*]:focus-visible:z-10",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Toolbar -- a wrapping row of controls above a table or list. Wraps instead of
 * scrolling horizontally, which is what the admin table used to do.
 */
export function Toolbar({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-3 shadow-sm",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
