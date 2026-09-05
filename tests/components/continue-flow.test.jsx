import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

/**
 * Regression tests for the "Continue to application" flow.
 *
 * Two defects are covered here:
 *  1. A signed-out user could select departments, click Continue, land on a
 *     dead-end sign-in card, and then be redirected to "/" after signing in --
 *     losing the selection entirely. Continue must now route through sign-in
 *     with the destination attached.
 *  2. Selection was keyed on the department display NAME. Since the name is now
 *     overridable in constants/departmentNames.js, selection and
 *     already-submitted detection must key on the stable id.
 */

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/departments",
  useSearchParams: () => new URLSearchParams(),
  notFound: vi.fn(),
}));

let sessionValue = { data: null, isPending: false };
vi.mock("@/lib/auth-client", () => ({
  authClient: { useSession: () => sessionValue },
}));

let submission = { ids: [], names: [], count: 0 };
vi.mock("@/components/SubmissionsProvider", () => ({
  useSubmissions: () => ({
    submittedDepartmentIds: submission.ids,
    submittedDepartments: submission.names,
    submittedCount: submission.count,
    isLoadingSubmissions: false,
    markDepartmentsSubmitted: vi.fn(),
    refreshSubmissions: vi.fn(),
  }),
  SubmissionsProvider: ({ children }) => children,
}));

const toastError = vi.fn();
vi.mock("sonner", () => ({ toast: { error: toastError, success: vi.fn() } }));

const { departments } = await import("@/constants/departments");
const { MAX_APPLICATIONS_PER_USER } = await import("@/lib/config");
const DepartmentsPage = (await import("@/app/(pages)/departments/page.jsx"))
  .default;

const signedIn = () => {
  sessionValue = { data: { user: { email: "a@example.com" } }, isPending: false };
};

const cards = () => screen.getAllByRole("button", { name: /continue|sign in/i });
const cardFor = (department) =>
  screen.getByLabelText(department.name, { exact: false });

beforeEach(() => {
  push.mockReset();
  toastError.mockReset();
  submission = { ids: [], names: [], count: 0 };
  sessionValue = { data: null, isPending: false };
});

describe("Continue to application — signed in", () => {
  beforeEach(signedIn);

  it("navigates straight to the application with one department", async () => {
    render(<DepartmentsPage />);
    const first = departments[0];

    await userEvent.click(cardFor(first));
    await userEvent.click(cards()[0]);

    expect(push).toHaveBeenCalledWith(`/join/${first.id}`);
  });

  it("navigates with both ids in catalogue order regardless of click order", async () => {
    render(<DepartmentsPage />);
    const [a, b] = departments;

    // Click the second one first.
    await userEvent.click(cardFor(b));
    await userEvent.click(cardFor(a));
    await userEvent.click(cards()[0]);

    expect(push).toHaveBeenCalledWith(`/join/${a.id}/${b.id}`);
  });

  it("is disabled with nothing selected", async () => {
    render(<DepartmentsPage />);
    for (const button of cards()) expect(button).toBeDisabled();
  });

  it("re-disables Continue when the last selection is removed", async () => {
    render(<DepartmentsPage />);
    const box = cardFor(departments[0]);

    await userEvent.click(box);
    for (const button of cards()) expect(button).toBeEnabled();

    await userEvent.click(box);
    for (const button of cards()) expect(button).toBeDisabled();
    expect(push).not.toHaveBeenCalled();
  });
});

describe("Continue to application — signed out", () => {
  it("routes through sign-in carrying the application as the return path", async () => {
    render(<DepartmentsPage />);
    const first = departments[0];

    await userEvent.click(cardFor(first));
    await userEvent.click(cards()[0]);

    expect(push).toHaveBeenCalledWith(
      `/auth/signin?next=${encodeURIComponent(`/join/${first.id}`)}`,
    );
  });

  it("labels the button so the sign-in step is not a surprise", async () => {
    render(<DepartmentsPage />);
    expect(
      screen.getAllByRole("button", { name: /sign in/i }).length,
    ).toBeGreaterThan(0);
  });
});

describe("Already-submitted detection", () => {
  beforeEach(signedIn);

  it("recognises a submitted department by id even if its name changed", async () => {
    // Simulate a rename: the stored record carries the id but an old name.
    submission = {
      ids: [departments[0].id],
      names: ["A Previous Name"],
      count: 1,
    };
    render(<DepartmentsPage />);

    expect(cardFor(departments[0])).toBeDisabled();
    // One slot remains, so a different department is still selectable.
    expect(cardFor(departments[1])).toBeEnabled();
  });

  it("still recognises legacy records that only stored a name", async () => {
    submission = { ids: [], names: [departments[0].name], count: 1 };
    render(<DepartmentsPage />);

    expect(cardFor(departments[0])).toBeDisabled();
  });

  it("disables everything once the cap is reached", async () => {
    submission = {
      ids: departments.slice(0, MAX_APPLICATIONS_PER_USER).map((d) => d.id),
      names: [],
      count: MAX_APPLICATIONS_PER_USER,
    };
    render(<DepartmentsPage />);

    for (const button of cards()) expect(button).toBeDisabled();
    expect(cardFor(departments[MAX_APPLICATIONS_PER_USER])).toBeDisabled();
  });
});
