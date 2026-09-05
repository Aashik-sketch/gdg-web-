/**
 * Layout for the application route.
 *
 * These URLs are per-applicant working pages, not content: they should never be
 * indexed. This also covers the invalid-id case -- `notFound()` in the page
 * renders the correct "Department not found" UI, but Next streams the response
 * (the root layout contains client components) so the status line is already
 * committed as 200 and cannot be changed to 404. Marking the subtree noindex
 * addresses the actual consequence of that limitation.
 */
export const metadata = {
  title: "Application",
  robots: { index: false, follow: false },
};

export default function JoinLayout({ children }) {
  return children;
}
