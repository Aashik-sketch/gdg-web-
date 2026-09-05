import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Breadcrumb -- Bootstrap's breadcrumb, as a proper <nav> + ordered list with
 * aria-current on the final crumb.
 *
 * Usage:
 *   <Breadcrumb items={[{label:"Home", href:"/"}, {label:"Departments"}]} />
 *
 * An item without an `href` is rendered as the current page.
 */
export function Breadcrumb({ items = [], className, ...props }) {
  if (!items.length) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn("w-full", className)} {...props}>
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="rounded transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={isLast ? "font-medium text-foreground" : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isLast && (
                <ChevronRight
                  className="h-3.5 w-3.5 shrink-0 opacity-60"
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
