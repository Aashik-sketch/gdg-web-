"use client";

import React, { useState } from "react";
import NavBar from "@/components/NavBar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import PopupComp from "@/components/PopupComp";
import { authClient } from "@/lib/auth-client";

const POPUP_DATA = {
  header: "Recruitment Notice",
  description: "Welcome to the recruitment portal.",
  message: [
    "Sign in with your email address to begin your application.",
    "You can apply to up to two departments.",
  ],
};

export default function Home() {
  const [isDialogOpen, setIsDialogOpen] = useState(true);
  const { data: session, isPending } = authClient.useSession();

  const user = session?.user;

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <main id="main-content" className="flex-1">
        <Hero />
      </main>
      <Footer />

      {!isPending && !user && (
        <PopupComp
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          PopupData={POPUP_DATA}
        />
      )}
    </div>
  );
}
