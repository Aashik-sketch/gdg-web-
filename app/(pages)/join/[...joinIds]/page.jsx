import React from "react";
import { notFound } from "next/navigation";
import { reviews } from "@/constants/index";
import JoinApplicationView from "./JoinApplicationView";

/**
 * Application route.
 *
 * This is a SERVER component that does nothing but validate the route segments.
 * Validation only needs `params` and the static department catalogue, both of
 * which are available on the server -- so calling `notFound()` here produces a
 * real HTTP 404. When the whole page was a client component, `notFound()`
 * rendered the not-found UI but the response still went out as 200, because the
 * shell had already been committed.
 *
 * Everything interactive (session, form state) lives in JoinApplicationView.
 */
export default function JoinDepartmentPage({ params }) {
  const ids = params?.joinIds ?? [];

  // Every route id MUST correspond to a real department. The old
  // `|| id.startsWith("clerk_")` escape hatch -- a leftover from a previous
  // auth provider -- let any id beginning with "clerk_" through, and is gone.
  const departments = ids.map((id) => reviews.find((dept) => dept.id === id));

  if (ids.length === 0 || !departments.every(Boolean)) {
    notFound();
  }

  // Only the fields the client actually needs are passed across the boundary,
  // rather than whole catalogue entries.
  const serialisableDepartments = departments.map((dept) => ({
    id: dept.id,
    name: dept.name,
  }));

  return <JoinApplicationView departments={serialisableDepartments} />;
}
