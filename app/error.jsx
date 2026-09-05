"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";

/**
 * App Router error boundary. Receives the thrown error and a reset() callback
 * that re-renders the segment.
 */
export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center"
    >
      <div className="space-y-2">
        <p className="font-display text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Something went wrong
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          An unexpected error occurred
        </h1>
        <p className="mx-auto max-w-md text-muted-foreground">
          Sorry about that. You can try again, and if the problem persists please
          come back later.
        </p>
      </div>
      <Button type="button" onClick={() => reset()}>
        Try again
      </Button>
    </main>
  );
}
