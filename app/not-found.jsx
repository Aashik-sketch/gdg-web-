import React from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center"
    >
      <div className="space-y-2">
        <p className="font-display text-sm font-medium uppercase tracking-widest text-muted-foreground">
          404
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Page not found
        </h1>
        <p className="mx-auto max-w-md text-muted-foreground">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
      </div>
      <Link href="/" className={cn(buttonVariants())}>
        Back to home
      </Link>
    </main>
  );
}
