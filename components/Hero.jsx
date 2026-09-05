import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Landing hero. Static content, no state or effects, so it can render as a
 * server component and ship no client JS.
 *
 * The primary CTA is a single styled Link (not a <button> nested inside a
 * <Link>, which is invalid interactive-nesting HTML). We reuse buttonVariants
 * so the anchor looks and focuses exactly like a Button.
 */
const HEADLINE = "Recruitment 2026";
const SUBHEADING = "Ready to make your mark?";
const DESCRIPTION =
  "Join our departments and work on real-world projects. Your journey starts here.";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="container mx-auto flex flex-col items-center gap-6 px-4 py-20 text-center sm:py-28 lg:py-36">
        <span className="inline-flex items-center rounded-full border border-border bg-muted px-4 py-1 text-sm font-medium text-muted-foreground animate-fade-up">
          {SUBHEADING}
        </span>
        <h1 className="max-w-3xl font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl animate-fade-up">
          {HEADLINE}
        </h1>
        <p className="max-w-xl text-base text-muted-foreground sm:text-lg animate-fade-up">
          {DESCRIPTION}
        </p>
        <div className="animate-fade-up">
          <Link
            href="/departments"
            className={cn(buttonVariants({ size: "lg" }), "gap-2")}
          >
            Join us
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
