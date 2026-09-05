import { betterAuth } from "better-auth";
import { firestoreAdapter } from "better-auth-firestore";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { getFirestoreDb } from "./firebase";

/**
 * better-auth configuration.
 *
 * Fixes applied:
 *  - Firebase is initialised once, in lib/firebase.js, instead of a second
 *    duplicate `initializeApp` here.
 *  - BETTER_AUTH_SECRET is now asserted at startup. Without it better-auth
 *    falls back to a well-known default key, which means session cookies can be
 *    forged by anyone.
 *  - Cookies are marked secure in production.
 */

const isProduction = process.env.NODE_ENV === "production";
const isBuildPhase =
  process.env.BUILDING === "1" ||
  process.env.NEXT_PHASE === "phase-production-build";

const secret = process.env.BETTER_AUTH_SECRET;
if (!secret && isProduction && !isBuildPhase) {
  throw new Error(
    "BETTER_AUTH_SECRET is not set. Generate a random 32+ character value; " +
      "without it session tokens are signed with a publicly known default key.",
  );
}
if (!secret && !isProduction) {
  console.warn(
    "BETTER_AUTH_SECRET is not set. Using a development-only fallback; set it before deploying.",
  );
}

const baseURL =
  process.env.BETTER_AUTH_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
  "http://localhost:3000";

export const auth = betterAuth({
  baseURL,
  secret: secret || "development-only-insecure-secret-change-me",
  database: firestoreAdapter({ firestore: getFirestoreDb() }),
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh at most once a day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes: a revoked role stops working promptly
    },
  },
  advanced: {
    useSecureCookies: isProduction,
    defaultCookieAttributes: {
      sameSite: "lax",
      httpOnly: true,
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 12,
  },
  socialProviders:
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {},
  plugins: [
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
    }),
    // nextCookies must remain the last plugin.
    nextCookies(),
  ],
});
