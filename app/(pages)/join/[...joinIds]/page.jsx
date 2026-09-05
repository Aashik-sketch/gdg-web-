import React from "react";
import { notFound } from "next/navigation";
import { getDepartmentById } from "@/constants/departments";
import JoinApplicationView from "./JoinApplicationView";

/**
 * Application route.
 *
 * This is a SERVER component that does nothing but validate the route segments,
 * so validation happens before any interactive code runs and the client never
 * has to decide whether a URL is legitimate.
 *
 * Note on status codes: `notFound()` renders the correct not-found UI, but the
 * response still goes out as 200 because the root layout contains client
 * components and Next streams the shell before this component throws. The
 * subtree is marked noindex in layout.jsx to address that.
 *
 * Everything interactive (session, form state) lives in JoinApplicationView.
 */
export default function JoinDepartmentPage({ params }) {
  const ids = params?.joinIds ?? [];

  // Every route id MUST correspond to a real department. The old
  // `|| id.startsWith("clerk_")` escape hatch -- a leftover from a previous
  // auth provider -- let any id beginning with "clerk_" through, and is gone.
  const departments = ids.map((id) => getDepartmentById(id));

  if (ids.length === 0 || !departments.every(Boolean)) {
    notFound();
  }

  // Only serialisable fields cross the boundary. `icon` is a React component
  // reference from the catalogue and must not be passed to a client component.
  const serialisableDepartments = departments.map((dept) => ({
    id: dept.id,
    name: dept.name,
    questions: dept.questions,
  }));

  return <JoinApplicationView departments={serialisableDepartments} />;
}
