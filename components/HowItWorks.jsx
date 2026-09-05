import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * "How it works" -- a three-step explanation of the application flow.
 *
 * Pure static content: no state, no effects, no client JS. The three steps are
 * rendered once as an ordered list of numbered cards.
 */
const STEPS = [
  {
    label: "Choose departments",
    description: "Pick up to two teams you want to apply to.",
  },
  {
    label: "Answer the questionnaire",
    description: "Tell us about yourself and your interests.",
  },
  {
    label: "Track your status",
    description: "Follow each application from review to result.",
  },
];

export default function HowItWorks() {
  return (
    <section
      aria-labelledby="how-it-works-heading"
      className="border-t border-border bg-muted/30"
    >
      <div className="container mx-auto px-4 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="softInfo" className="mb-4">
            Simple process
          </Badge>
          <h2
            id="how-it-works-heading"
            className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            How it works
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Three steps from browsing departments to tracking your result.
          </p>
        </div>

        {/* The three steps are shown once, as numbered cards. A Stepper is
            deliberately NOT used here: this section explains the process to a
            visitor, and a stepper with an "active" step would falsely imply the
            visitor has already started. The real Stepper lives on the
            departments and application pages, where progress is genuine. */}
        <ol className="mx-auto mt-12 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.label}>
              <Card className="h-full transition-colors hover:border-primary/40">
                <CardHeader>
                  <span
                    aria-hidden="true"
                    className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 font-display text-sm font-bold text-primary"
                  >
                    {index + 1}
                  </span>
                  <CardTitle className="text-lg">
                    <span className="sr-only">Step {index + 1}: </span>
                    {step.label}
                  </CardTitle>
                  <CardDescription>{step.description}</CardDescription>
                </CardHeader>
              </Card>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
