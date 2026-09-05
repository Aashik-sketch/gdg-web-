/**
 * Central runtime configuration.
 *
 * Values that used to be hardcoded across route handlers and components live
 * here so that a single change (or a single env var) updates the whole app.
 */

/**
 * Application deadline.
 *
 * Previously hardcoded as "2026-08-23T23:59:59+05:30" in BOTH
 * app/api/submit-form/route.js and components/common/CountdownTimer.jsx, which
 * meant the two could drift and the deadline could not be changed without a
 * code deploy. Override with NEXT_PUBLIC_APPLICATION_DEADLINE (an ISO-8601
 * string with an explicit offset).
 */
export const APPLICATION_DEADLINE =
  process.env.NEXT_PUBLIC_APPLICATION_DEADLINE || "2026-12-31T23:59:59+05:30";

/** Maximum number of distinct departments a single applicant may apply to. */
export const MAX_APPLICATIONS_PER_USER = Number(
  process.env.NEXT_PUBLIC_MAX_APPLICATIONS_PER_USER || 2,
);

/** Firestore collection holding applicant submissions. */
export const APPLICATIONS_COLLECTION = "formData";

/** `true` once the deadline has passed. Safe to call on both server and client. */
export const isDeadlinePassed = (now = new Date()) => {
  const deadline = new Date(APPLICATION_DEADLINE);
  if (Number.isNaN(deadline.getTime())) {
    // A malformed deadline must not silently disable submissions.
    console.error(
      `Invalid APPLICATION_DEADLINE: "${APPLICATION_DEADLINE}". Treating deadline as open.`,
    );
    return false;
  }
  return now.getTime() > deadline.getTime();
};
