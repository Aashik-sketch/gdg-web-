import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// --- Mocks -----------------------------------------------------------------

// auth-client: control the session returned to NavBar.
const useSessionMock = vi.fn();
vi.mock("@/lib/auth-client", () => ({
  authClient: {
    useSession: () => useSessionMock(),
  },
}));

// next/navigation: NavBar uses usePathname + UserButton uses useRouter.
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn() }),
}));

// next-themes: ThemeToggle (mounted in NavBar) needs a theme context.
vi.mock("next-themes", () => ({
  useTheme: () => ({ setTheme: vi.fn(), resolvedTheme: "light" }),
}));

import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import PopupComp from "@/components/PopupComp";

beforeEach(() => {
  useSessionMock.mockReset();
});

describe("NavBar", () => {
  it("shows a Sign In link when unauthenticated", () => {
    useSessionMock.mockReturnValue({ data: null, isPending: false });
    render(<NavBar />);
    const signIn = screen.getAllByRole("link", { name: /sign in/i });
    expect(signIn.length).toBeGreaterThan(0);
    expect(signIn[0]).toHaveAttribute("href", "/auth/signin");
    expect(
      screen.queryByRole("link", { name: /admin panel/i }),
    ).not.toBeInTheDocument();
  });

  it("shows the Admin Panel link when the user role is admin", () => {
    useSessionMock.mockReturnValue({
      data: { user: { email: "a@example.com", role: "admin" } },
      isPending: false,
    });
    render(<NavBar />);
    const adminLinks = screen.getAllByRole("link", { name: /admin panel/i });
    expect(adminLinks.length).toBeGreaterThan(0);
    expect(adminLinks[0]).toHaveAttribute("href", "/admin");
  });

  it("hides the Admin Panel link for role 'user'", () => {
    useSessionMock.mockReturnValue({
      data: { user: { email: "u@example.com", role: "user" } },
      isPending: false,
    });
    render(<NavBar />);
    expect(
      screen.queryByRole("link", { name: /admin panel/i }),
    ).not.toBeInTheDocument();
  });
});

describe("Footer", () => {
  it("renders the current year", () => {
    render(<Footer />);
    const year = new Date().getFullYear().toString();
    expect(
      screen.getByText((content) => content.includes(year)),
    ).toBeInTheDocument();
  });
});

describe("PopupComp", () => {
  const popupData = {
    header: "Recruitment Notice",
    description: "Welcome to the recruitment portal.",
    message: ["First message", "Second message"],
  };

  it("renders its header, description and messages", () => {
    render(
      <PopupComp isOpen={true} onClose={() => {}} PopupData={popupData} />,
    );
    expect(screen.getByText("Recruitment Notice")).toBeInTheDocument();
    expect(
      screen.getByText("Welcome to the recruitment portal."),
    ).toBeInTheDocument();
    expect(screen.getByText("First message")).toBeInTheDocument();
    expect(screen.getByText("Second message")).toBeInTheDocument();
  });

  it("calls onClose when the Got it button is clicked", () => {
    const onClose = vi.fn();
    render(
      <PopupComp isOpen={true} onClose={onClose} PopupData={popupData} />,
    );
    fireEvent.click(screen.getByRole("button", { name: /got it/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it("renders nothing when closed", () => {
    render(
      <PopupComp isOpen={false} onClose={() => {}} PopupData={popupData} />,
    );
    expect(screen.queryByText("Recruitment Notice")).not.toBeInTheDocument();
  });
});
