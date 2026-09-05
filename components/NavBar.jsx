"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import UserButton from "./UserButton";
import ThemeToggle from "./ThemeToggle";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

/** Inline admin-role check. `isAdmin` from lib/authz is server-only (it imports
 *  next/headers), so it must not be imported into this client component. */
function userIsAdmin(session) {
  return Boolean(
    session?.user?.role
      ?.split(",")
      .map((r) => r.trim().toLowerCase())
      .includes("admin"),
  );
}

const NavBar = () => {
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Everything below is derived directly from `session` during render -- no
  // mirrored useState/useEffect chains, no leaked listeners, no clock interval.
  const isAuthenticated = Boolean(session?.user?.email);
  const hasAdminPermissions = userIsAdmin(session);

  const navItems = [{ label: "Departments", href: "/departments" }];
  if (isAuthenticated && hasAdminPermissions) {
    navItems.push({ label: "Admin Panel", href: "/admin" });
  }

  const isActive = (href) =>
    pathname === href || pathname?.startsWith(`${href}/`);

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav
        aria-label="Primary"
        className="container mx-auto flex h-16 items-center justify-between px-4"
      >
        <Link
          href="/"
          className="font-display text-lg font-semibold tracking-tight text-foreground"
          onClick={closeMobile}
        >
          Recruitment Portal
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground",
                isActive(item.href)
                  ? "text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}

          <ThemeToggle />

          {isPending ? (
            <span className="text-sm text-muted-foreground">Loading…</span>
          ) : !isAuthenticated ? (
            <Link
              href="/auth/signin"
              className="text-sm font-medium text-foreground hover:underline"
            >
              Sign In
            </Link>
          ) : (
            <UserButton user={session.user} />
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground hover:bg-accent"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile panel -- full-width offcanvas-style sheet with large tap
          targets. No scroll/resize listeners; visibility is driven purely by
          the toggle state. */}
      {mobileOpen && (
        <div
          id="mobile-nav"
          className="w-full border-t border-border bg-background md:hidden"
        >
          <nav
            aria-label="Mobile"
            className="container mx-auto flex flex-col px-4 py-3"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobile}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "flex min-h-[44px] items-center rounded-md px-3 text-base font-medium transition-colors hover:bg-accent",
                  isActive(item.href)
                    ? "text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}

            <div className="my-2 border-t border-border" />

            {isPending ? (
              <span className="flex min-h-[44px] items-center px-3 text-base text-muted-foreground">
                Loading…
              </span>
            ) : !isAuthenticated ? (
              <Link
                href="/auth/signin"
                onClick={closeMobile}
                className="flex min-h-[44px] items-center rounded-md px-3 text-base font-medium text-foreground hover:bg-accent"
              >
                Sign In
              </Link>
            ) : (
              <div className="flex min-h-[44px] items-center px-3">
                <UserButton user={session.user} />
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default NavBar;
