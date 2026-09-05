import React from "react";
import GDGLoader from "@/components/GDGLoader";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <GDGLoader label="Loading page" />
    </div>
  );
}
