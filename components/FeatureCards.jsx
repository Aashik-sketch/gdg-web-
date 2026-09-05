import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Rocket, LineChart, ShieldCheck } from "lucide-react";

/**
 * "What you get" -- a neutral feature grid describing the experience of
 * applying, authored here rather than sourced from constants/index.js (whose
 * department copy is scrambled placeholder text). This keeps the section
 * readable and layout-stable regardless of that placeholder data.
 *
 * Static content only: server component, no client JS.
 */
const FEATURES = [
  {
    icon: Users,
    title: "Real teams",
    description:
      "Join a department working on live projects alongside experienced members.",
  },
  {
    icon: Rocket,
    title: "Hands-on work",
    description:
      "Contribute from day one and grow your skills on things that ship.",
  },
  {
    icon: LineChart,
    title: "Clear progress",
    description:
      "Every application shows where it stands, from submission to decision.",
  },
  {
    icon: ShieldCheck,
    title: "Fair review",
    description:
      "A short questionnaire gives everyone the same chance to be seen.",
  },
];

export default function FeatureCards() {
  return (
    <section
      aria-labelledby="features-heading"
      className="border-t border-border"
    >
      <div className="container mx-auto px-4 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="softSuccess" className="mb-4">
            What you get
          </Badge>
          <h2
            id="features-heading"
            className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            Built for people who want to build
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            A straightforward path into the work that matters to you.
          </p>
        </div>

        <ul className="mx-auto mt-12 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <li key={feature.title}>
                <Card className="h-full transition-colors hover:border-primary/40">
                  <CardHeader>
                    <span
                      aria-hidden="true"
                      className="mb-2 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary"
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <CardTitle
                      className="truncate text-lg"
                      title={feature.title}
                    >
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="line-clamp-3">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
