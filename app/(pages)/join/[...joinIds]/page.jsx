"use client";

import React, { useMemo } from "react";
import { useRouter, notFound } from "next/navigation";
import { reviews } from "@/constants/index";

import NavBar from "@/components/NavBar";
import FormComp from "@/components/FormComp";
import Footer from "@/components/Footer";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

const JoinDepartmentPage = ({ params }) => {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const ids = useMemo(() => params?.joinIds ?? [], [params]);

  // Every route id MUST correspond to a real department. The old `||
  // id.startsWith("clerk_")` escape hatch (leftover from a previous auth
  // provider) let any id beginning with "clerk_" bypass validation, so it is
  // gone. Validation runs BEFORE any render output, so an invalid URL 404s
  // immediately instead of flashing a loading screen first.
  const departments = useMemo(
    () => ids.map((id) => reviews.find((dept) => dept.id === id)),
    [ids],
  );

  const isValid = ids.length > 0 && departments.every(Boolean);

  if (!isValid) {
    notFound();
  }

  if (isPending) {
    return (
      <main id="main-content" className="min-h-screen bg-background text-foreground">
        <NavBar />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <span className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" />
            <p>Loading...</p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  const user = session?.user;
  const isSignedIn = !!user;

  return (
    <main id="main-content" className="min-h-screen bg-background text-foreground">
      <NavBar />
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        {isSignedIn ? (
          <FormComp dept1={departments[0]} dept2={departments[1]} />
        ) : (
          <section className="mx-auto max-w-md rounded-lg border border-border bg-card p-8 text-center shadow-sm">
            <h2 className="font-display text-2xl font-semibold text-foreground">
              Authentication Required
            </h2>
            <p className="mt-2 text-muted-foreground">
              Please sign in to access the application form.
            </p>
            <Button className="mt-6" onClick={() => router.push("/auth/signin")}>
              Sign In
            </Button>
          </section>
        )}
      </div>
      <Footer />
    </main>
  );
};

export default JoinDepartmentPage;
