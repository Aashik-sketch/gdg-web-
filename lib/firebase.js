import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

/**
 * Single Firebase Admin initialisation point.
 *
 * lib/db.ts and lib/auth.js each used to call `initializeApp` with their own
 * copy of the credential-reading logic, and both silently fell back to the
 * project id "demo-DWASFW-rec" when the environment was incomplete -- so a
 * misconfigured production deploy wrote to a throwaway project instead of
 * failing. Credentials are now read once, and a production process without
 * credentials fails loudly.
 */

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
// Private keys are stored with literal "\n" sequences in .env files.
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

const hasServiceAccount = Boolean(projectId && clientEmail && privateKey);
const hasAmbientCredentials =
  Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS) ||
  Boolean(process.env.FIRESTORE_EMULATOR_HOST);

export const hasFirebaseCredentials = hasServiceAccount || hasAmbientCredentials;

/**
 * `true` during `next build`, when route modules are imported for analysis and
 * no request is ever served. Set BUILDING=1 in the build command.
 */
const isBuildPhase =
  process.env.BUILDING === "1" || process.env.NEXT_PHASE === "phase-production-build";

const assertConfigured = () => {
  if (hasFirebaseCredentials) return;
  if (isBuildPhase) return;
  throw new Error(
    "Firebase is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL " +
      "and FIREBASE_PRIVATE_KEY, or GOOGLE_APPLICATION_CREDENTIALS, or " +
      "FIRESTORE_EMULATOR_HOST for local development.",
  );
};

/** Reuse the app across hot reloads and across serverless invocations. */
const globalCache = globalThis;

/** @returns {import("firebase-admin/app").App} */
export const getFirebaseApp = () => {
  const existing = getApps()[0];
  if (existing) return existing;

  assertConfigured();

  const options = {};
  // During the build phase there may be no project id at all; Firestore is
  // never actually queried, so a placeholder keeps module evaluation working.
  options.projectId = projectId || (isBuildPhase ? "build-placeholder" : undefined);

  if (hasServiceAccount) {
    options.credential = cert({ projectId, clientEmail, privateKey });
  }

  return initializeApp(options);
};

/** @returns {import("firebase-admin/firestore").Firestore} */
export const getFirestoreDb = () => {
  if (!globalCache.__firestoreDb) {
    globalCache.__firestoreDb = getFirestore(getFirebaseApp());
  }
  return globalCache.__firestoreDb;
};
