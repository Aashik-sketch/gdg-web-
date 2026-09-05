import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  APPLICATION_DEADLINE,
  MAX_APPLICATIONS_PER_USER,
  isDeadlinePassed,
} from "@/lib/config";
import { cn } from "@/lib/utils";

/**
 * Landing hero. Static content, no state or effects, so it renders as a server
 * component and ships no client JS.
 *
 * The background is a layered, token-driven mesh: two soft radial gradients in
 * the primary/info hues plus a very light dot grid, all built with Tailwind
 * arbitrary values so there are no images, no canvas and no new dependencies.
 * It is purely decorative and hidden from assistive tech.
 *
 * CTAs are styled Links (not <button> nested in <Link>), reusing buttonVariants
 * so anchors look and focus exactly like Buttons.
 */
const HEADLINE = "Recruitment 2026";
const SUBHEADING = "Ready to make your mark?";
const DESCRIPTION =
  "Join our departments and work on real-world projects. Your journey starts here.";

export default function Hero() {
  // Derived on the server at request time. `isDeadlinePassed` and the cap both
  // come from lib/config, the same source the API and countdown use.
  const closed = isDeadlinePassed();
  const deadlineLabel = new Date(APPLICATION_DEADLINE).toLocaleDateString(
    "en-IN",
    { day: "numeric", month: "short", year: "numeric" },
  );

  return (
    <section className="relative overflow-hidden">
      {/* Decorative layered background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,hsl(var(--primary)/0.10),transparent_70%),radial-gradient(40%_40%_at_85%_20%,hsl(var(--info)/0.10),transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(hsl(var(--foreground)/0.06)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(70%_60%_at_50%_35%,black,transparent)]"
      />

      <div className="container mx-auto flex flex-col items-center gap-6 px-4 py-20 text-center sm:py-28 lg:py-36">
        <Badge variant="softInfo" dot className="animate-fade-up">
          {SUBHEADING}
        </Badge>
        <h1 className="max-w-3xl font-display text-4xl font-bold tracking-tight text-foreground animate-fade-up sm:text-5xl lg:text-6xl">
          {HEADLINE}
        </h1>
        <p className="max-w-xl text-base text-muted-foreground animate-fade-up sm:text-lg">
          {DESCRIPTION}
        </p>

        <div className="flex flex-col items-center gap-3 animate-fade-up sm:flex-row">
          <Link
            href="/departments"
            className={cn(buttonVariants({ size: "lg" }), "gap-2")}
          >
            Join us
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href="#how-it-works-heading"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            See how it works
          </Link>
        </div>

        {/* Status strip. Derived from the shared config rather than hardcoded,
            so it cannot claim applications are open after the deadline. */}
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2 animate-fade-up">
          {closed ? (
            <Badge variant="softDestructive" dot>
              Applications closed
            </Badge>
          ) : (
            <Badge variant="softSuccess" dot>
              Applications open
            </Badge>
          )}
          <Badge variant="softMuted">
            Up to {MAX_APPLICATIONS_PER_USER} departments
          </Badge>
          <Badge variant="softMuted">
            Closes {deadlineLabel}
          </Badge>
        </div>
      </div>
    </section>
  );
}
