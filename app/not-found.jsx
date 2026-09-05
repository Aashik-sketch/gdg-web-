import React from "react";
import Link from "next/link";
import { Compass } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/stat-card";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="flex min-h-screen items-center justify-center px-4"
    >
      <EmptyState
        icon={<Compass className="h-6 w-6" aria-hidden="true" />}
        title="Page not found"
        description="The page you are looking for doesn't exist or has been moved."
        action={
          <Link href="/" className={cn(buttonVariants(), "mt-2")}>
            Back to home
          </Link>
        }
      />
    </main>
  );
}
