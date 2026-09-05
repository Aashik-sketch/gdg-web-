"use client";

import React, { useMemo } from "react";
import DataTable from "./DataTable";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { StatCard, EmptyState } from "@/components/ui/stat-card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Clock, Building2, Inbox } from "lucide-react";

/**
 * Presentational shell for the admin console.
 *
 * Authentication and the admin role check now happen on the server in
 * app/(pages)/admin/page.jsx *before* this component ever renders, so all of
 * the previous client-side session/role/audit machinery (and the 80k-iteration
 * "permission signature" loop that ran in the render body) has been removed.
 */
const AdminContent = ({ applicants = [] }) => {
  // A single memoised pass computes every summary figure. Do NOT split this
  // back into chained useState/useEffect.
  const { total, shortlisted, notReviewed, departmentCount, byDepartment } =
    useMemo(() => {
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
        notReviewed: applicants.length - shortlistedCount,
        departmentCount: byDept.size,
        byDepartment: Array.from(byDept.entries()).sort((a, b) => b[1] - a[1]),
      };
    }, [applicants]);

  const isEmpty = applicants.length === 0;
  const topDeptCount = byDepartment.length ? byDepartment[0][1] : 0;

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 animate-fade-up">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Admin Console" },
        ]}
      />

      <header className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Admin Console
        </h1>
        <p className="text-sm text-muted-foreground">
          Review, filter, shortlist and contact applicants.
        </p>
      </header>

      {isEmpty ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={<Inbox className="h-6 w-6" aria-hidden="true" />}
              title="No applicants yet"
              description="Applications will appear here as soon as candidates start submitting. Summary metrics and the applicant table populate automatically."
            />
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total applicants"
              value={total}
              hint="All submissions received"
              icon={<Users className="h-5 w-5" aria-hidden="true" />}
            />
            <StatCard
              label="Shortlisted"
              value={shortlisted}
              hint={`${
                total ? Math.round((shortlisted / total) * 100) : 0
              }% of applicants`}
              tone="success"
              icon={<UserCheck className="h-5 w-5" aria-hidden="true" />}
            />
            <StatCard
              label="Not yet reviewed"
              value={notReviewed}
              hint="Awaiting a shortlist decision"
              tone="warning"
              icon={<Clock className="h-5 w-5" aria-hidden="true" />}
            />
            <StatCard
              label="Departments"
              value={departmentCount}
              hint="Represented across applicants"
              tone="info"
              icon={<Building2 className="h-5 w-5" aria-hidden="true" />}
            />
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
              <CardTitle className="text-base font-semibold">
                Applicants by department
              </CardTitle>
              <Badge variant="softMuted" size="sm">
                {departmentCount} department{departmentCount === 1 ? "" : "s"}
              </Badge>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-3">
                {byDepartment.map(([dept, count]) => (
                  <li key={dept}>
                    <Progress
                      value={count}
                      max={topDeptCount}
                      tone="primary"
                      label={dept}
                      showValue
                    />
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}

      <DataTable data={applicants} />
    </section>
  );
};

export default AdminContent;
