/**
 * Post-sign-in return paths.
 *
 * The sign-in page used to always send the user to "/", so anyone who clicked
 * "Continue to application" while signed out was bounced to the home page and
 * lost their department selection -- which looks exactly like a broken button.
 * These helpers carry the intended destination through sign-in.
 *
 * Only same-origin, absolute-path destinations are allowed. Anything else
 * (absolute URLs, protocol-relative "//evil.com", non-string input) falls back
 * to the default, so the parameter cannot be used as an open redirect.
 */

export const RETURN_PARAM = "next";
export const DEFAULT_RETURN_PATH = "/";

/**
 * @param {unknown} candidate
 * @returns {boolean} whether the value is a safe internal path.
 */
export function isSafeReturnPath(candidate) {
  if (typeof candidate !== "string") return false;
  if (!candidate.startsWith("/")) return false;
  // "//host" and "/\host" are protocol-relative and would leave the origin.
  if (candidate.startsWith("//") || candidate.startsWith("/\\")) return false;
  // A backslash or control character can be normalised by some browsers into
  // an authority separator; reject outright.
  if (/[\\\u0000-\u001f]/.test(candidate)) return false;
  return true;
}

/**
 * @param {unknown} candidate
 * @param {string} [fallback]
 * @returns {string} a safe internal path.
 */
export function sanitiseReturnPath(candidate, fallback = DEFAULT_RETURN_PATH) {
  return isSafeReturnPath(candidate) ? candidate : fallback;
}

/**
 * Build a sign-in URL that returns to `returnTo` afterwards.
 * @param {string} [returnTo]
 * @returns {string}
 */
export function signInHref(returnTo) {
  if (!isSafeReturnPath(returnTo) || returnTo === DEFAULT_RETURN_PATH) {
    return "/auth/signin";
  }
  return `/auth/signin?${RETURN_PARAM}=${encodeURIComponent(returnTo)}`;
}
