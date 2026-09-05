import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor, within, fireEvent } from "@testing-library/react";

// --- Mocks -----------------------------------------------------------------

vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  }),
}));

// The cmdk-based filter popovers are awkward to drive in jsdom, so replace them
// with minimal buttons that call the same `filterFunc` contract the real ones
// use. This keeps the test focused on DataTable's filtering logic (defect 4).
vi.mock("@/components/FilterDepartment", () => ({
  default: ({ filterFunc }) => (
    <button type="button" onClick={() => filterFunc("Alpha")}>
      dept-alpha
    </button>
  ),
}));
vi.mock("@/components/FilterShortlisted", () => ({
  default: ({ filterFunc }) => (
    <button type="button" onClick={() => filterFunc("true")}>
      short-yes
    </button>
  ),
}));
vi.mock("@/components/DialogComp", () => ({
  default: () => <div data-testid="dialog-comp" />,
}));
vi.mock("@/components/MailComposer", () => ({
  default: () => <div data-testid="mail-composer" />,
}));
vi.mock("react-csv", () => ({
  CSVLink: ({ children }) => <a href="#csv">{children}</a>,
}));

import DataTable from "@/components/DataTable";
import { toast } from "sonner";

const APPLICANTS = [
  {
    _id: "a1",
    id: "a1",
    Name: "Alice Ada",
    RegistrationNumber: "R001",
    Email: "alice@example.com",
    Phone: "111",
    Department: "Alpha",
    Pref: 1,
    shortlisted: false,
  },
  {
    _id: "a2",
    id: "a2",
    Name: "Bob Byte",
    RegistrationNumber: "R002",
    Email: "bob@example.com",
    Phone: "222",
    Department: "Beta",
    Pref: 2,
    shortlisted: false,
  },
  {
    _id: "a3",
    id: "a3",
    Name: "Carol Code",
    RegistrationNumber: "R003",
    Email: "carol@example.com",
    Phone: "333",
    Department: "Alpha",
    Pref: 3,
    shortlisted: true,
  },
];

const dataRows = () =>
  screen
    .getAllByRole("row")
    .filter((row) => within(row).queryAllByRole("columnheader").length === 0);

beforeEach(() => {
  vi.clearAllMocks();
  global.fetch = vi.fn();
});

describe("DataTable", () => {
  it("renders one row per applicant", () => {
    render(<DataTable data={APPLICANTS} />);
    expect(screen.getByText("Alice Ada")).toBeInTheDocument();
    expect(screen.getByText("Bob Byte")).toBeInTheDocument();
    expect(screen.getByText("Carol Code")).toBeInTheDocument();
    expect(dataRows()).toHaveLength(APPLICANTS.length);
  });

  it("filtering by department narrows the rows", async () => {
    render(<DataTable data={APPLICANTS} />);
    fireEvent.click(screen.getByText("dept-alpha"));

    await waitFor(() => {
      expect(dataRows()).toHaveLength(2); // Alice + Carol
    });
    expect(screen.queryByText("Bob Byte")).not.toBeInTheDocument();
    expect(screen.getByText("Alice Ada")).toBeInTheDocument();
    expect(screen.getByText("Carol Code")).toBeInTheDocument();
  });

  it("clearing the filter restores ALL rows (regression for defect 4)", async () => {
    render(<DataTable data={APPLICANTS} />);

    fireEvent.click(screen.getByText("dept-alpha"));
    await waitFor(() => expect(dataRows()).toHaveLength(2));

    fireEvent.click(screen.getByRole("button", { name: /reset filters/i }));

    await waitFor(() => {
      expect(dataRows()).toHaveLength(APPLICANTS.length);
    });
    expect(screen.getByText("Bob Byte")).toBeInTheDocument();
    expect(screen.getByText("Alice Ada")).toBeInTheDocument();
    expect(screen.getByText("Carol Code")).toBeInTheDocument();
  });

  it("filtering by shortlisted status narrows the rows", async () => {
    render(<DataTable data={APPLICANTS} />);
    fireEvent.click(screen.getByText("short-yes"));

    await waitFor(() => {
      expect(dataRows()).toHaveLength(1); // only Carol is shortlisted
    });
    expect(screen.getByText("Carol Code")).toBeInTheDocument();
    expect(screen.queryByText("Alice Ada")).not.toBeInTheDocument();
  });

  it("reverts the optimistic shortlist update when the request fails", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ success: false, message: "Server exploded" }),
    });

    render(<DataTable data={APPLICANTS} />);

    const shortlistBtn = screen.getByRole("button", {
      name: /^Shortlist Alice Ada$/i,
    });
    fireEvent.click(shortlistBtn);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Server exploded");
    });
    // Optimistic change reverted -> button label is back to "Shortlist".
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /^Shortlist Alice Ada$/i })
      ).toBeInTheDocument();
    });
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/shortlist/a1",
      expect.objectContaining({ method: "PATCH" })
    );
  });

  it("keeps the optimistic shortlist update when the request succeeds", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: { _id: "a1", shortlisted: true } }),
    });

    render(<DataTable data={APPLICANTS} />);

    fireEvent.click(
      screen.getByRole("button", { name: /^Shortlist Alice Ada$/i })
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Remove shortlist from Alice Ada/i })
      ).toBeInTheDocument();
    });
    expect(toast.success).toHaveBeenCalled();
  });

  it("shows a status badge for each applicant, not colour alone", () => {
    render(<DataTable data={APPLICANTS} />);
    // Two of the three fixtures are not reviewed, one is shortlisted.
    expect(screen.getAllByText("Not reviewed")).toHaveLength(2);
    expect(screen.getByText("Shortlisted")).toBeInTheDocument();
  });

  it("shows an empty state with a Clear filters action when nothing matches", async () => {
    render(<DataTable data={APPLICANTS} />);

    // Narrow to shortlisted=Yes then also search for a name that is not
    // shortlisted, so the combined filters match nothing.
    fireEvent.click(screen.getByText("short-yes"));
    await waitFor(() => expect(dataRows()).toHaveLength(1));

    fireEvent.change(screen.getByLabelText(/search applicants/i), {
      target: { value: "Alice" },
    });

    await waitFor(() => {
      expect(screen.getByText(/no matching applicants/i)).toBeInTheDocument();
    });

    // The empty-state clear action restores every row.
    fireEvent.click(
      screen.getByRole("button", { name: /clear filters/i })
    );

    await waitFor(() => {
      expect(dataRows()).toHaveLength(APPLICANTS.length);
    });
  });

  it("disables the shortlist button while its request is in flight", async () => {
    let resolveFetch;
    global.fetch.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveFetch = resolve;
      })
    );

    render(<DataTable data={APPLICANTS} />);

    // Alice starts not-shortlisted; the optimistic flip makes her label
    // "Remove shortlist from" immediately after clicking.
    const shortlistBtn = screen.getByRole("button", {
      name: /^Shortlist Alice Ada$/i,
    });
    fireEvent.click(shortlistBtn);

    await waitFor(() => {
      const pending = screen.getByRole("button", {
        name: /Remove shortlist from Alice Ada/i,
      });
      expect(pending).toBeDisabled();
    });

    resolveFetch({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    });

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: /Remove shortlist from Alice Ada/i,
        })
      ).not.toBeDisabled();
    });
  });
});
