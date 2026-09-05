"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { reviews } from "@/constants";
import { MAX_APPLICATIONS_PER_USER } from "@/lib/config";
import { useSubmissions } from "@/components/SubmissionsProvider";
import CountdownTimer from "@/components/common/CountdownTimer";

// The catalogue is a static import; there is no need to deep-clone it into
// state via an effect. Use it directly.
const departments = reviews;

/**
 * A single selectable department card. Hoisted out of the page component so it
 * is defined once (never re-created on every render) and keyed on a stable
 * identifier so rows do not remount and lose focus.
 */
const DepartmentCard = ({ department, isSelected, isSubmitted, isAtCap, onToggle }) => {
  const disabled = isSubmitted || (isAtCap && !isSelected);
  const inputId = `dept-${department.id}`;

  return (
    <li>
      <label
        htmlFor={inputId}
        className={`group flex h-full cursor-pointer flex-col rounded-lg border bg-card p-4 shadow-sm transition-colors ${
          isSelected ? "border-primary ring-2 ring-ring" : "border-border hover:border-primary/50"
        } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
      >
        <div className="flex items-start gap-3">
          <input
            id={inputId}
            type="checkbox"
            className="mt-1 h-4 w-4 shrink-0 rounded border-input accent-primary"
            disabled={disabled}
            checked={isSelected}
            onChange={() => onToggle(department.name)}
            aria-describedby={`${inputId}-desc`}
          />
          <div className="min-w-0">
            <span
              className="block truncate font-display font-semibold text-foreground"
              title={department.name}
            >
              {department.name}
            </span>
            {isSubmitted && (
              <span className="mt-1 inline-block rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
                Already submitted
              </span>
            )}
          </div>
        </div>
        <p
          id={`${inputId}-desc`}
          className="mt-3 line-clamp-3 break-words text-sm text-muted-foreground"
        >
          {department.description}
        </p>
      </label>
    </li>
  );
};

const DepartmentsListPage = () => {
  const router = useRouter();
  const { submittedDepartments } = useSubmissions();
  const [selectedDepartments, setSelectedDepartments] = useState([]);

  // Everything below is derived during render -- no mirrored useState/useEffect
  // chains that can fall out of sync.
  const remainingSlots = Math.max(
    0,
    MAX_APPLICATIONS_PER_USER - submittedDepartments.length,
  );
  const selectedIds = departments
    .filter((dept) => selectedDepartments.includes(dept.name))
    .map((dept) => dept.id);
  const selectedCount = selectedDepartments.length;
  const isContinueDisabled = selectedIds.length === 0;
  const isAtCap = selectedCount >= remainingSlots;

  const toggleDepartment = (departmentName) => {
    if (submittedDepartments.includes(departmentName)) {
      toast.error(`You have already submitted an application for ${departmentName}.`);
      return;
    }

    if (remainingSlots <= 0) {
      toast.error(
        `You have already submitted the maximum allowed (${MAX_APPLICATIONS_PER_USER}) applications.`,
      );
      return;
    }

    setSelectedDepartments((current) => {
      const isSelected = current.includes(departmentName);
      if (isSelected) {
        return current.filter((name) => name !== departmentName);
      }
      if (current.length >= remainingSlots) {
        toast.error(`You can select at most ${remainingSlots} department(s).`);
        return current;
      }
      return [...current, departmentName];
    });
  };

  const goToApplication = () => {
    if (!selectedIds.length) return;
    router.push(`/join/${selectedIds.join("/")}`);
  };

  return (
    <main id="main-content" className="min-h-screen bg-background text-foreground">
      <NavBar />

      <div className="mx-auto w-full max-w-5xl px-4 pb-28 pt-8 md:pb-16">
        <header className="mb-8">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Step 01 · Select
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Pick your departments
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Select up to{" "}
            <strong className="text-foreground">{MAX_APPLICATIONS_PER_USER}</strong>{" "}
            departments. Check the departments you wish to apply for.
          </p>
          <p
            className="mt-4 text-sm font-medium text-foreground"
            aria-live="polite"
          >
            {selectedCount} of {MAX_APPLICATIONS_PER_USER} selected
          </p>

          {/* The countdown component existed but was never rendered anywhere --
              it was a dead import in NavBar and FormComp. It is bound to the
              shared APPLICATION_DEADLINE, so this is the one place applicants
              see how long they have left. */}
          <div className="mt-6 inline-flex flex-col gap-2 rounded-lg border border-border bg-card px-5 py-4">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Applications close in
            </span>
            <CountdownTimer />
          </div>

          {/* Inline continue button for md+ where the sticky bar is hidden. */}
          <button
            type="button"
            onClick={goToApplication}
            disabled={isContinueDisabled}
            className="mt-4 hidden items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 md:inline-flex"
          >
            Continue to application →
          </button>
        </header>

        <section aria-labelledby="available-departments">
          <h2
            id="available-departments"
            className="mb-4 font-display text-xl font-semibold"
          >
            Available Departments
          </h2>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {departments.map((department) => (
              <DepartmentCard
                key={department.id}
                department={department}
                isSelected={selectedDepartments.includes(department.name)}
                isSubmitted={submittedDepartments.includes(department.name)}
                isAtCap={isAtCap}
                onToggle={toggleDepartment}
              />
            ))}
          </ul>
        </section>
      </div>

      {/* Sticky action bar for mobile so Continue is always reachable. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-4 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">
            {selectedCount} of {MAX_APPLICATIONS_PER_USER} selected
          </span>
          <button
            type="button"
            onClick={goToApplication}
            disabled={isContinueDisabled}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            Continue →
          </button>
        </div>
      </div>

      <Footer />
    </main>
  );
};

export default DepartmentsListPage;
