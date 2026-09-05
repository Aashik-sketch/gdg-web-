import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Progress } from "@/components/ui/progress";
import { Stepper } from "@/components/ui/stepper";
import { Spinner, Skeleton } from "@/components/ui/spinner";
import { StatCard, EmptyState } from "@/components/ui/stat-card";
import { ButtonGroup } from "@/components/ui/button-group";

describe("Alert", () => {
  it("renders title and description", () => {
    render(
      <Alert variant="info">
        <AlertTitle>Heads up</AlertTitle>
        <AlertDescription>Something to know.</AlertDescription>
      </Alert>,
    );
    expect(screen.getByText("Heads up")).toBeInTheDocument();
    expect(screen.getByText("Something to know.")).toBeInTheDocument();
  });

  it("uses role=alert for the destructive variant so errors are announced", () => {
    render(<Alert variant="destructive">Broken</Alert>);
    expect(screen.getByRole("alert")).toHaveTextContent("Broken");
  });

  it("uses role=status for non-error variants", () => {
    render(<Alert variant="success">Saved</Alert>);
    expect(screen.getByRole("status")).toHaveTextContent("Saved");
  });

  it("calls onDismiss when dismissible", async () => {
    const onDismiss = vi.fn();
    render(
      <Alert variant="warning" dismissible onDismiss={onDismiss}>
        Careful
      </Alert>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });
});

describe("Badge", () => {
  it("renders its children", () => {
    render(<Badge variant="softSuccess">Shortlisted</Badge>);
    expect(screen.getByText("Shortlisted")).toBeInTheDocument();
  });
});

describe("Breadcrumb", () => {
  it("marks the last crumb as the current page and does not link it", () => {
    render(
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Departments", href: "/departments" },
          { label: "Apply" },
        ]}
      />,
    );
    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(nav).toBeInTheDocument();
    expect(screen.getByText("Apply")).toHaveAttribute("aria-current", "page");
    expect(screen.queryByRole("link", { name: "Apply" })).toBeNull();
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
  });

  it("renders nothing when given no items", () => {
    const { container } = render(<Breadcrumb items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("Progress", () => {
  it("exposes accessible progressbar values", () => {
    render(<Progress value={1} max={2} label="Applications used" />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "1");
    expect(bar).toHaveAttribute("aria-valuemax", "2");
  });

  it("clamps a value above max instead of overflowing", () => {
    render(<Progress value={99} max={2} label="Used" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "2");
  });

  it("clamps a negative value to zero", () => {
    render(<Progress value={-5} max={10} label="Used" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
  });
});

describe("Stepper", () => {
  const steps = [
    { label: "Select" },
    { label: "Apply" },
    { label: "Submitted" },
  ];

  it("marks the active step with aria-current", () => {
    render(<Stepper steps={steps} current={1} />);
    const items = screen.getAllByRole("listitem");
    expect(items[1]).toHaveAttribute("aria-current", "step");
    expect(items[0]).not.toHaveAttribute("aria-current");
  });

  it("labels completed steps for screen readers rather than by colour alone", () => {
    render(<Stepper steps={steps} current={2} />);
    // current=2 means steps 0 and 1 are both complete.
    expect(screen.getAllByText("(completed)", { exact: false })).toHaveLength(2);
  });

  it("renders nothing when given no steps", () => {
    const { container } = render(<Stepper steps={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("Spinner and Skeleton", () => {
  it("gives the spinner an accessible label", () => {
    render(<Spinner label="Loading applicants" />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading applicants");
  });

  it("hides the skeleton from assistive technology", () => {
    const { container } = render(<Skeleton className="h-4 w-10" />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });
});

describe("StatCard and EmptyState", () => {
  it("renders a stat label and value", () => {
    render(<StatCard label="Total" value={42} hint="all departments" />);
    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders an empty state with an action", () => {
    render(
      <EmptyState
        title="No applicants yet"
        description="Applications will appear here."
        action={<button type="button">Refresh</button>}
      />,
    );
    expect(screen.getByText("No applicants yet")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Refresh" })).toBeInTheDocument();
  });
});

describe("ButtonGroup", () => {
  it("is exposed as a labelled group", () => {
    render(
      <ButtonGroup aria-label="Filters">
        <button type="button">A</button>
        <button type="button">B</button>
      </ButtonGroup>,
    );
    expect(screen.getByRole("group", { name: "Filters" })).toBeInTheDocument();
  });
});
