import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

/**
 * Static site footer.
 *
 * A plain (server) component: no state, no effects, zero client JavaScript.
 * The copyright year is computed directly at render time.
 */
const FOOTER_LINKS = [
  { name: "Home", path: "/" },
  { name: "Departments", path: "/departments" },
];

const ORGANIZATION_LABEL = "Recruitment Portal";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand blurb */}
          <div className="lg:col-span-2">
            <p className="font-display text-lg font-semibold tracking-tight text-foreground">
              {ORGANIZATION_LABEL}
            </p>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              Apply to join a department, answer a short questionnaire, and
              track your applications from review to result — all in one place.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-sm font-semibold text-foreground">Navigate</p>
            <nav aria-label="Footer" className="mt-4">
              <ul className="space-y-3">
                {FOOTER_LINKS.map((link) => (
                  <li key={link.path}>
                    <Link
                      href={link.path}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Recruitment window */}
          <div>
            <p className="text-sm font-semibold text-foreground">
              Recruitment window
            </p>
            <div className="mt-4 space-y-3">
              <Badge variant="softSuccess" dot>
                Applications open
              </Badge>
              <p className="text-sm text-muted-foreground">
                Applications are reviewed on a rolling basis during the open
                recruitment window.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} {ORGANIZATION_LABEL}
          </p>
        </div>
      </div>
    </footer>
  );
}
