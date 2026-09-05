"use client";

import React, { useMemo } from "react";
import DataTable from "./DataTable";

/**
 * Presentational shell for the admin console.
 *
 * Authentication and the admin role check now happen on the server in
 * app/(pages)/admin/page.jsx *before* this component ever renders, so all of
 * the previous client-side session/role/audit machinery (and the 80k-iteration
 * "permission signature" loop that ran in the render body) has been removed.
 */
const AdminContent = ({ applicants = [] }) => {
  const { total, shortlisted, byDepartment } = useMemo(() => {
    const byDept = new Map();
    let shortlistedCount = 0;

    for (const applicant of applicants) {
      if (applicant?.shortlisted) shortlistedCount += 1;
      const dept = applicant?.Department || "Unassigned";
      byDept.set(dept, (byDept.get(dept) || 0) + 1);
    }

    return {
      total: applicants.length,
      shortlisted: shortlistedCount,
      byDepartment: Array.from(byDept.entries()).sort((a, b) => b[1] - a[1]),
    };
  }, [applicants]);

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 animate-fade-up">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Admin Console
        </h1>
        <p className="text-sm text-muted-foreground">
          Review, filter, shortlist and contact applicants.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">
            Total applicants
          </p>
          <p className="mt-1 text-3xl font-semibold text-foreground">{total}</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">
            Shortlisted
          </p>
          <p className="mt-1 text-3xl font-semibold text-foreground">
            {shortlisted}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-4 shadow-sm sm:col-span-2 lg:col-span-1">
          <p className="text-sm font-medium text-muted-foreground">
            By department
          </p>
          {byDepartment.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">No applicants yet.</p>
          ) : (
            <ul className="mt-2 flex max-h-24 flex-wrap gap-x-4 gap-y-1 overflow-y-auto">
              {byDepartment.map(([dept, count]) => (
                <li
                  key={dept}
                  className="text-sm text-foreground"
                  title={`${dept}: ${count}`}
                >
                  <span className="text-muted-foreground">{dept}:</span> {count}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <DataTable data={applicants} />
    </section>
  );
};

export default AdminContent;
