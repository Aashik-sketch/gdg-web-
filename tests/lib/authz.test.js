import { beforeEach, describe, expect, it, vi } from "vitest";

// lib/authz imports lib/auth, which would initialise better-auth and Firebase.
// Both are stubbed so these tests exercise only the authorization logic.
const getSession = vi.fn();

vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: (...args) => getSession(...args) } },
}));

vi.mock("next/headers", () => ({
  headers: async () => new Headers(),
}));

const { isAdmin, requireAdmin, requireUser, getCurrentUser } = await import(
  "@/lib/authz"
);

beforeEach(() => {
  getSession.mockReset();
});

describe("isAdmin", () => {
  it("accepts the admin role", () => {
    expect(isAdmin({ role: "admin" })).toBe(true);
  });

  it("accepts admin within a comma-separated role list", () => {
    expect(isAdmin({ role: "user,admin" })).toBe(true);
  });

  it("is case-insensitive", () => {
    expect(isAdmin({ role: "Admin" })).toBe(true);
  });

  it("rejects a plain user", () => {
    expect(isAdmin({ role: "user" })).toBe(false);
  });

  it("rejects a user with no role", () => {
    expect(isAdmin({})).toBe(false);
  });

  it("rejects null", () => {
    expect(isAdmin(null)).toBe(false);
  });

  it("does not treat a role that merely contains 'admin' as admin", () => {
    expect(isAdmin({ role: "administrator-assistant" })).toBe(false);
    expect(isAdmin({ role: "notadmin" })).toBe(false);
  });
});

describe("requireUser", () => {
  it("returns 401 when there is no session", async () => {
    getSession.mockResolvedValue(null);
    const { user, response } = await requireUser();
    expect(user).toBeNull();
    expect(response.status).toBe(401);
  });

  it("returns the user when a session exists", async () => {
    getSession.mockResolvedValue({ user: { email: "a@example.com" } });
    const { user, response } = await requireUser();
    expect(response).toBeNull();
    expect(user.email).toBe("a@example.com");
  });
});

describe("requireAdmin", () => {
  it("returns 401 when unauthenticated", async () => {
    getSession.mockResolvedValue(null);
    const { response } = await requireAdmin();
    expect(response.status).toBe(401);
  });

  it("returns 403 for an authenticated non-admin", async () => {
    getSession.mockResolvedValue({ user: { email: "a@example.com", role: "user" } });
    const { user, response } = await requireAdmin();
    expect(user).toBeNull();
    expect(response.status).toBe(403);
  });

  it("allows an admin through", async () => {
    getSession.mockResolvedValue({ user: { email: "a@example.com", role: "admin" } });
    const { user, response } = await requireAdmin();
    expect(response).toBeNull();
    expect(user.role).toBe("admin");
  });
});

describe("getCurrentUser", () => {
  it("treats a session lookup failure as unauthenticated rather than throwing", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    getSession.mockRejectedValue(new Error("cookie store unavailable"));
    await expect(getCurrentUser()).resolves.toBeNull();
  });
});
