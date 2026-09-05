import Link from "next/link";
import { SearchX } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/stat-card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground"
    >
      <Card className="w-full max-w-md animate-fade-up">
        <EmptyState
          icon={<SearchX className="h-6 w-6" aria-hidden="true" />}
          title="Department not found"
          description="Sorry, the department you're looking for doesn't exist or has been removed."
          action={
            <div className="mt-1 flex flex-col items-center gap-3 sm:flex-row">
              <Link href="/departments" className={cn(buttonVariants())}>
                Browse all departments
              </Link>
              <Link
                href="/"
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                Go home
              </Link>
            </div>
          }
        />
      </Card>
    </main>
  );
}
