import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * Server-side authorization helpers.
 *
 * Every privileged read/write must go through `requireUser` or `requireAdmin`.
 * Before this module existed, /api/send-email, /api/admin/applicants and
 * /api/shortlist/[id] performed no authentication at all, and /admin performed
 * its role check in a client component *after* the server had already
 * serialized the full applicant list into the RSC payload.
 */

/** Roles that grant access to the admin console and admin APIs. */
const ADMIN_ROLES = new Set(["admin"]);

/**
 * Resolve the current session from request cookies.
 * @returns {Promise<import("better-auth").Session["session"] & {user: any} | null>}
 */
export async function getCurrentSession() {
  try {
    return await auth.api.getSession({ headers: await headers() });
  } catch (error) {
    // A failure to verify a session is an unauthenticated request, not a 500.
    console.error("Failed to resolve session:", error);
    return null;
  }
}

/** @returns {Promise<any|null>} the authenticated user, or null. */
export async function getCurrentUser() {
  const session = await getCurrentSession();
  return session?.user ?? null;
}

/** @returns {boolean} whether the given user holds an admin role. */
export function isAdmin(user) {
  if (!user) return false;
  // better-auth's admin plugin may expose a single role or a comma-separated list.
  const roles = String(user.role ?? "")
    .split(",")
    .map((role) => role.trim().toLowerCase())
    .filter(Boolean);
  return roles.some((role) => ADMIN_ROLES.has(role));
}

/** @returns {Promise<boolean>} whether the caller is an authenticated admin. */
export async function isCurrentUserAdmin() {
  return isAdmin(await getCurrentUser());
}

/**
 * Require an authenticated user.
 *
 * Usage in a route handler:
 *   const { user, response } = await requireUser();
 *   if (response) return response;
 *
 * @returns {Promise<{user: any|null, response: NextResponse|null}>}
 */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        { message: "Authentication required" },
        { status: 401 },
      ),
    };
  }
  return { user, response: null };
}

/**
 * Require an authenticated user holding an admin role.
 *
 * Returns 401 when unauthenticated and 403 when authenticated without the role,
 * so callers can distinguish "sign in" from "you may not do this".
 *
 * @returns {Promise<{user: any|null, response: NextResponse|null}>}
 */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        { message: "Authentication required" },
        { status: 401 },
      ),
    };
  }
  if (!isAdmin(user)) {
    return {
      user: null,
      response: NextResponse.json(
        { message: "Administrator privileges required" },
        { status: 403 },
      ),
    };
  }
  return { user, response: null };
}
