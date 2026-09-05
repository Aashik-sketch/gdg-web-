"use client";

import React, { useEffect } from "react";
import { RotateCcw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/stat-card";

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
      className="flex min-h-screen items-center justify-center px-4"
    >
      <EmptyState
        icon={<TriangleAlert className="h-6 w-6 text-destructive" aria-hidden="true" />}
        title="An unexpected error occurred"
        description="Sorry about that. You can try again, and if the problem persists please come back later."
        action={
          <Button type="button" onClick={() => reset()} className="mt-2 gap-2">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Try again
          </Button>
        }
      />
    </main>
  );
}
