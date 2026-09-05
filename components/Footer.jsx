import React from "react";
import Link from "next/link";

/**
 * Static site footer.
 *
 * This is a plain (server) component: it holds no state and needs no effects,
 * so it ships zero client JavaScript. The copyright year is computed directly
 * at render time.
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
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row">
        <p className="text-sm text-muted-foreground">
          &copy; {currentYear} {ORGANIZATION_LABEL}
        </p>
        <nav aria-label="Footer">
          <ul className="flex items-center gap-6">
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
    </footer>
  );
}
