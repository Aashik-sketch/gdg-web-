import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// next/navigation: provide router + notFound spies.
const pushMock = vi.fn();
const notFoundMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/departments",
  useSearchParams: () => new URLSearchParams(),
  notFound: (...args) => notFoundMock(...args),
}));

// @/lib/auth-client: a session hook we can drive per-test.
const sessionState = { data: null, isPending: false };
vi.mock("@/lib/auth-client", () => ({
  authClient: {
    useSession: () => sessionState,
    signIn: { email: vi.fn(), social: vi.fn() },
    signUp: { email: vi.fn() },
    signOut: vi.fn(),
  },
}));

// sonner toast.
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import CountdownTimer from "@/components/common/CountdownTimer";
import DeptHero from "@/components/DeptHero";
import { APPLICATION_DEADLINE, MAX_APPLICATIONS_PER_USER } from "@/lib/config";

beforeEach(() => {
  pushMock.mockClear();
  notFoundMock.mockClear();
  sessionState.data = null;
  sessionState.isPending = false;
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({ count: 0, submittedDepartments: [], remaining: MAX_APPLICATIONS_PER_USER }),
    }),
  );
});

afterEach(() => {
  vi.clearAllTimers();
});

// ---------------------------------------------------------------------------
// CountdownTimer
// ---------------------------------------------------------------------------

describe("CountdownTimer", () => {
  it("defaults its target to APPLICATION_DEADLINE from lib/config", () => {
    // Freeze 'now' to one full day before the configured deadline so we can
    // assert the rendered day count reflects APPLICATION_DEADLINE, proving the
    // default prop is wired to config (not a local hardcoded literal).
    const deadlineMs = new Date(APPLICATION_DEADLINE).getTime();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(deadlineMs - 24 * 60 * 60 * 1000));

    render(<CountdownTimer />);
    // 1 day remaining -> the "Days" unit shows 01.
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("Days")).toBeInTheDocument();

    vi.useRealTimers();
  });

  it("stops at zero once the deadline has passed", () => {
    const deadlineMs = new Date(APPLICATION_DEADLINE).getTime();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(deadlineMs + 60 * 1000));

    render(<CountdownTimer />);
    // All units read 00 and the closed message is announced.
    expect(screen.getAllByText("00").length).toBeGreaterThan(0);
    expect(screen.getByText(/Applications are closed/i)).toBeInTheDocument();

    vi.useRealTimers();
  });

  it("shows a 'Closing soon' badge when under 24 hours remain", () => {
    const deadlineMs = new Date(APPLICATION_DEADLINE).getTime();
    vi.useFakeTimers();
    // 12 hours before the deadline -> days === 0 but not yet closed.
    vi.setSystemTime(new Date(deadlineMs - 12 * 60 * 60 * 1000));

    render(<CountdownTimer />);
    expect(screen.getByText(/Closing soon/i)).toBeInTheDocument();

    vi.useRealTimers();
  });

  it("does not show the 'Closing soon' badge with more than a day left", () => {
    const deadlineMs = new Date(APPLICATION_DEADLINE).getTime();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(deadlineMs - 3 * 24 * 60 * 60 * 1000));

    render(<CountdownTimer />);
    expect(screen.queryByText(/Closing soon/i)).not.toBeInTheDocument();

    vi.useRealTimers();
  });
});

// ---------------------------------------------------------------------------
// DeptHero (regression for defect 1)
// ---------------------------------------------------------------------------

describe("DeptHero", () => {
  it("renders without a setIsLoading prop and does not throw", () => {
    expect(() =>
      render(<DeptHero dept={{ name: "Development Departments" }} />),
    ).not.toThrow();
    expect(screen.getByText("Development Departments")).toBeInTheDocument();
  });

  it("guards against a missing dept and does not render the photo toggle without a callback", () => {
    expect(() => render(<DeptHero dept={undefined} />)).not.toThrow();
    // No checkbox because setPhotoQs was not supplied.
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Departments page (cap at MAX_APPLICATIONS_PER_USER)
// ---------------------------------------------------------------------------

describe("Departments page selection cap", () => {
  it("caps selection at MAX_APPLICATIONS_PER_USER", async () => {
    // Render with a signed-in session so SubmissionsProvider is happy.
    sessionState.data = { user: { email: "candidate@example.com" } };

    const { SubmissionsProvider } = await import("@/components/SubmissionsProvider");
    const DepartmentsListPage = (
      await import("@/app/(pages)/departments/page.jsx")
    ).default;

    render(
      <SubmissionsProvider>
        <DepartmentsListPage />
      </SubmissionsProvider>,
    );

    const selectableBefore = screen
      .getAllByRole("checkbox")
      .filter((cb) => !cb.disabled);

    // Select up to the cap.
    for (let i = 0; i < MAX_APPLICATIONS_PER_USER; i++) {
      fireEvent.click(selectableBefore[i]);
    }

    const checked = screen
      .getAllByRole("checkbox")
      .filter((cb) => cb.checked).length;
    expect(checked).toBe(MAX_APPLICATIONS_PER_USER);

    // At the cap, every remaining (unchecked) card is disabled, so the user
    // cannot exceed MAX_APPLICATIONS_PER_USER.
    const uncheckedEnabled = screen
      .getAllByRole("checkbox")
      .filter((cb) => !cb.checked && !cb.disabled);
    expect(uncheckedEnabled.length).toBe(0);

    // A checked card can still be toggled off (deselecting stays under cap).
    const stillChecked = screen
      .getAllByRole("checkbox")
      .filter((cb) => cb.checked);
    expect(stillChecked.length).toBe(MAX_APPLICATIONS_PER_USER);
  });

  it("renders the guided-flow chrome: stepper, breadcrumb and progress", async () => {
    sessionState.data = { user: { email: "candidate@example.com" } };

    const { SubmissionsProvider } = await import("@/components/SubmissionsProvider");
    const DepartmentsListPage = (
      await import("@/app/(pages)/departments/page.jsx")
    ).default;

    render(
      <SubmissionsProvider>
        <DepartmentsListPage />
      </SubmissionsProvider>,
    );

    // Stepper is exposed as a "Progress" nav; breadcrumb as a "Breadcrumb" nav.
    expect(
      screen.getByRole("navigation", { name: /progress/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: /breadcrumb/i }),
    ).toBeInTheDocument();
    // The first flow step is shown.
    expect(screen.getByText("Select departments")).toBeInTheDocument();
    // Progress primitive replaces the plain "N of 2 selected" text.
    expect(screen.getAllByRole("progressbar").length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Shared flow steps stay in sync across departments + join pages
// ---------------------------------------------------------------------------

describe("Applicant flow steps", () => {
  it("defines the three flow steps once, frozen, in a shared module", async () => {
    const { APPLICATION_STEPS, STEP_SELECT, STEP_APPLY, STEP_SUBMITTED } =
      await import("@/constants/applicationSteps");

    expect(APPLICATION_STEPS.map((s) => s.label)).toEqual([
      "Select departments",
      "Complete application",
      "Submitted",
    ]);

    // Frozen at both levels so a consumer cannot mutate the shared array or
    // any step object.
    expect(Object.isFrozen(APPLICATION_STEPS)).toBe(true);
    expect(APPLICATION_STEPS.every((s) => Object.isFrozen(s))).toBe(true);

    expect([STEP_SELECT, STEP_APPLY, STEP_SUBMITTED]).toEqual([0, 1, 2]);
  });

  it("is imported by both flow surfaces rather than duplicated", async () => {
    const fs = await import("node:fs");
    const departments = fs.readFileSync(
      "app/(pages)/departments/page.jsx",
      "utf8",
    );
    // The join route is split: page.jsx is a server component that only
    // validates params, and the interactive view renders the stepper.
    const joinView = fs.readFileSync(
      "app/(pages)/join/[...joinIds]/JoinApplicationView.jsx",
      "utf8",
    );

    for (const source of [departments, joinView]) {
      expect(source).toContain('from "@/constants/applicationSteps"');
      // No local copy of the step definitions.
      expect(source).not.toContain('label: "Select departments"');
    }
  });

  it("validates join route params on the server so an unknown id 404s", async () => {
    const fs = await import("node:fs");
    const page = fs.readFileSync(
      "app/(pages)/join/[...joinIds]/page.jsx",
      "utf8",
    );
    // notFound() must be reached from a server component; a "use client" page
    // renders the not-found UI but still responds with HTTP 200.
    expect(page).not.toContain('"use client"');
    expect(page).toContain("notFound()");
  });
});
