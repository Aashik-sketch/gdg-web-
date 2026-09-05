import React from "react";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import DeptHero from "@/components/DeptHero";
import { reviews } from "@/constants";

// The development landing page highlights a couple of departments. The IDs are
// the single source of truth; the display name/description are looked up in
// `reviews` so this page can never drift from the catalogue, and any ID that is
// no longer present is simply omitted rather than rendered as a dead link.
const FEATURED_DEPARTMENT_IDS = [
  "3936d5a2-acd9-4a98-ac97-42c2c92f5c02",
  "8143de1d-db17-42fa-958d-13b10804f894",
];

const features = FEATURED_DEPARTMENT_IDS.map((id) =>
  reviews.find((review) => review.id === id),
).filter(Boolean);

const page = () => {
  return (
    <main id="main-content" className="min-h-screen bg-background text-foreground">
      <NavBar />
      <DeptHero dept={{ name: "Development Departments" }} />

      <div className="mx-auto w-full max-w-5xl px-4 pb-16">
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {features.map((feature) => (
            <li key={feature.id}>
              <div className="flex h-full flex-col rounded-lg border border-border bg-card p-6 shadow-sm transition-colors hover:border-primary/50">
                <h2
                  className="font-display text-lg font-semibold text-foreground break-words"
                  title={feature.name}
                >
                  {feature.name}
                </h2>
                <p className="mt-2 flex-1 text-sm text-muted-foreground break-words">
                  {feature.description}
                </p>
                <Link
                  href={`/join/${feature.id}`}
                  className="mt-4 inline-flex w-fit items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  Join
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
};

export default page;
