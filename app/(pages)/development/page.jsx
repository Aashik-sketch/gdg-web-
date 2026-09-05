import React from "react";
import Link from "next/link";
import { Inbox } from "lucide-react";
import NavBar from "@/components/NavBar";
import DeptHero from "@/components/DeptHero";
import { reviews } from "@/constants";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/stat-card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

      <div className="mx-auto w-full max-w-5xl px-4 pt-6">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Development" },
          ]}
        />
      </div>

      <DeptHero dept={{ name: "Development Departments" }} />

      <div className="mx-auto w-full max-w-5xl px-4 pb-16">
        {features.length > 0 ? (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {features.map((feature) => (
              <li key={feature.id}>
                <Card className="flex h-full flex-col animate-fade-up transition-shadow hover:shadow-md">
                  <CardHeader>
                    <CardTitle
                      className="break-words font-display text-lg"
                      title={feature.name}
                    >
                      <span className="line-clamp-2">{feature.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col">
                    <p className="line-clamp-4 flex-1 break-words text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                    <Link
                      href={`/join/${feature.id}`}
                      className={cn(buttonVariants(), "mt-4 w-fit")}
                    >
                      Join
                    </Link>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        ) : (
          <Card>
            <EmptyState
              icon={<Inbox className="h-6 w-6" aria-hidden="true" />}
              title="No featured departments"
              description="There are no development departments to feature right now. Browse the full catalogue instead."
              action={
                <Link
                  href="/departments"
                  className={cn(buttonVariants({ variant: "outline" }), "mt-1")}
                >
                  Browse all departments
                </Link>
              }
            />
          </Card>
        )}
      </div>
    </main>
  );
};

export default page;
