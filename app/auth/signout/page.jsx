"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SignOutPage() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  // Sign-out is a state-changing action, so it MUST be triggered by an explicit
  // user gesture -- never from an effect on GET navigation, which a link
  // prefetch or crawler could fire.
  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await authClient.signOut();
      toast.success("Signed out successfully");
      router.push("/");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
      setSigningOut(false);
    }
  };

  return (
    <main
      id="main-content"
      className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground"
    >
      <Card className="w-full max-w-sm animate-fade-up">
        <CardHeader>
          <CardTitle className="font-display">Sign out</CardTitle>
          <CardDescription>
            Are you sure you want to sign out of your account?
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button onClick={handleSignOut} disabled={signingOut} aria-busy={signingOut}>
            {signingOut ? (
              <>
                <Spinner size="sm" label="Signing out" className="mr-2" />
                <span aria-hidden="true">Signing out…</span>
              </>
            ) : (
              "Sign out"
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            disabled={signingOut}
          >
            Cancel
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
