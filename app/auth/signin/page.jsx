import React, { Suspense } from "react";
import SignInForm from "./SignInForm";
import GDGLoader from "@/components/GDGLoader";

export const metadata = {
  title: "Sign in",
  description: "Sign in to apply to a department.",
  robots: { index: false, follow: false },
};

/**
 * Sign-in route.
 *
 * The form reads the `next` query parameter so it can return the user to the
 * page they came from -- previously sign-in always redirected to "/", which
 * silently discarded a department selection made before signing in.
 *
 * `useSearchParams` requires a Suspense boundary above it, so this thin server
 * component provides one and the interactive form lives in SignInForm.
 */
export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <main
          id="main-content"
          className="flex min-h-screen items-center justify-center bg-background text-foreground"
        >
          <GDGLoader label="Loading sign in" />
        </main>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
