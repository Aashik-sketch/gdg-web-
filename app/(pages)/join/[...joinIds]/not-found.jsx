import Link from "next/link";

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center text-foreground"
    >
      <h2 className="font-display text-3xl font-bold tracking-tight">
        Department Not Found
      </h2>
      <p className="mt-3 max-w-md text-muted-foreground">
        Sorry, the department you&apos;re looking for doesn&apos;t exist or has
        been removed.
      </p>
      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href="/departments"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Browse All Departments
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Go Home
        </Link>
      </div>
    </main>
  );
}
