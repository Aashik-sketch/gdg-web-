import { describe, expect, it } from "vitest";
import {
  APPLICATION_DEADLINE,
  MAX_APPLICATIONS_PER_USER,
  isDeadlinePassed,
} from "@/lib/config";

describe("application deadline configuration", () => {
  it("exposes a parseable ISO deadline", () => {
    expect(Number.isNaN(new Date(APPLICATION_DEADLINE).getTime())).toBe(false);
  });

  it("reports the deadline as open before it elapses", () => {
    const justBefore = new Date(new Date(APPLICATION_DEADLINE).getTime() - 1000);
    expect(isDeadlinePassed(justBefore)).toBe(false);
  });

  it("reports the deadline as passed after it elapses", () => {
    const justAfter = new Date(new Date(APPLICATION_DEADLINE).getTime() + 1000);
    expect(isDeadlinePassed(justAfter)).toBe(true);
  });

  it("is not already in the past, which would block all submissions", () => {
    // Regression test for the hardcoded 2026-08-23 deadline that silently
    // rejected every submission with a 403 once that date passed.
    expect(isDeadlinePassed(new Date())).toBe(false);
  });

  it("caps applications at a positive integer", () => {
    expect(MAX_APPLICATIONS_PER_USER).toBeGreaterThan(0);
    expect(Number.isInteger(MAX_APPLICATIONS_PER_USER)).toBe(true);
  });
});
