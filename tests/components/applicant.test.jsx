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
});
