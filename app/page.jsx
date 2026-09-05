"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import NavBar from "@/components/NavBar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import FeatureCards from "@/components/FeatureCards";
import Footer from "@/components/Footer";
import PopupComp from "@/components/PopupComp";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const POPUP_DATA = {
  header: "Recruitment Notice",
  description: "Welcome to the recruitment portal.",
  message: [
    "Sign in with your email address to begin your application.",
    "You can apply to up to two departments.",
  ],
};

export default function Home() {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  // The notice is no longer an unsolicited page-load interstitial. It shows as
  // a dismissible banner for signed-out visitors, and the same PopupComp stays
  // available on demand via "View details".
  const [bannerVisible, setBannerVisible] = useState(true);
  const [noticeOpen, setNoticeOpen] = useState(false);

  const showBanner = !isPending && !user && bannerVisible;

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <main id="main-content" className="flex-1">
        {showBanner && (
          <div className="container mx-auto px-4 pt-4">
            <Alert
              variant="info"
              dismissible
              onDismiss={() => setBannerVisible(false)}
            >
              <AlertTitle>{POPUP_DATA.header}</AlertTitle>
              <AlertDescription>
                Sign in to begin your application. You can apply to up to two
                departments.{" "}
                <button
                  type="button"
                  onClick={() => setNoticeOpen(true)}
                  className="font-medium text-foreground underline underline-offset-4 hover:text-info"
                >
                  View details
                </button>
              </AlertDescription>
            </Alert>
          </div>
        )}

        <Hero />
        <HowItWorks />
        <FeatureCards />

        {/* Closing CTA */}
        <section
          aria-labelledby="cta-heading"
          className="border-t border-border bg-muted/30"
        >
          <div className="container mx-auto px-4 py-16 text-center sm:py-20 lg:py-24">
            <h2
              id="cta-heading"
              className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            >
              {user ? "Pick up where you left off" : "Ready to get started?"}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
              {user
                ? "Continue your application and track where each one stands."
                : "Choose your departments, answer a few questions, and track your status in one place."}
            </p>
            <div className="mt-8 flex justify-center">
              {isPending ? (
                <Button size="lg" disabled>
                  Loading…
                </Button>
              ) : user ? (
                <Link
                  href="/departments"
                  className={cn(buttonVariants({ size: "lg" }), "gap-2")}
                >
                  Continue your application
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              ) : (
                <Link
                  href="/auth/signin"
                  className={cn(buttonVariants({ size: "lg" }), "gap-2")}
                >
                  Sign in to apply
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />

      {/* PopupComp stays functional, but is now opened on demand only. */}
      <PopupComp
        isOpen={noticeOpen}
        onClose={() => setNoticeOpen(false)}
        PopupData={POPUP_DATA}
      />
    </div>
  );
}
