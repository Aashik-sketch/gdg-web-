"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";

import NavBar from "@/components/NavBar";
import FormComp from "@/components/FormComp";
import Footer from "@/components/Footer";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Stepper } from "@/components/ui/stepper";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APPLICATION_STEPS, STEP_APPLY } from "@/constants/applicationSteps";
import { signInHref } from "@/lib/redirect";

/**
 * Interactive half of the application route.
 *
 * Route validation already happened on the server in page.jsx, so this
 * component can assume `departments` contains one or two valid entries and
 * concern itself only with the session and the form.
 */
export default function JoinApplicationView({ departments = [] }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <main
        id="main-content"
        className="min-h-screen bg-background text-foreground"
      >
        <NavBar />
        <div
          aria-busy="true"
          className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-muted-foreground"
        >
          <Spinner size="lg" label="Loading application" />
          <p>Loading…</p>
        </div>
        <Footer />
      </main>
    );
  }

  const isSignedIn = Boolean(session?.user);

  return (
    <main
      id="main-content"
      className="min-h-screen bg-background text-foreground"
    >
      <NavBar />
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <Breadcrumb
          className="mb-6"
          items={[
            { label: "Home", href: "/" },
            { label: "Departments", href: "/departments" },
            { label: "Application" },
          ]}
        />

        <div className="mb-8 rounded-xl border border-border bg-card/50 p-4 sm:p-6">
          <Stepper steps={APPLICATION_STEPS} current={STEP_APPLY} />
        </div>

        {isSignedIn ? (
          <FormComp departments={departments} />
        ) : (
          <Card className="mx-auto max-w-md animate-fade-up text-center">
            <CardHeader>
              <CardTitle className="font-display text-2xl">
                Sign in to continue
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                You need an account before you can fill in the application form.
                Your selections will still be here afterwards.
              </p>
              <Button
                className="w-full"
                onClick={() => router.push(signInHref(pathname))}
              >
                Sign in
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      <Footer />
    </main>
  );
}
