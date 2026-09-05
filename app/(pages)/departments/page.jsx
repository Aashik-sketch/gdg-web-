"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Inbox } from "lucide-react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { reviews } from "@/constants";
import { MAX_APPLICATIONS_PER_USER } from "@/lib/config";
import { useSubmissions } from "@/components/SubmissionsProvider";
import CountdownTimer from "@/components/common/CountdownTimer";
import { Stepper } from "@/components/ui/stepper";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  APPLICATION_STEPS,
  STEP_SELECT,
} from "@/constants/applicationSteps";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";

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
        className={`group flex h-full cursor-pointer flex-col rounded-xl border bg-card p-4 shadow-sm transition-all ${
          isSelected
            ? "border-primary ring-2 ring-ring"
            : "border-border hover:border-primary/50 hover:shadow-md"
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
          <div className="min-w-0 flex-1">
            <span
              className="block truncate font-display font-semibold text-foreground"
              title={department.name}
            >
              {department.name}
            </span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {isSubmitted && (
                <Badge variant="softSuccess" size="sm" dot>
                  Already submitted
                </Badge>
              )}
              {isSelected && !isSubmitted && (
                <Badge variant="softMuted" size="sm" dot>
                  Selected
                </Badge>
              )}
            </div>
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
  const submittedCount = Math.min(
    submittedDepartments.length,
    MAX_APPLICATIONS_PER_USER,
  );
  const isContinueDisabled = selectedIds.length === 0;
  const isAtCap = selectedCount >= remainingSlots;
  const noSlotsLeft = remainingSlots <= 0;
  const hasDepartments = departments.length > 0;

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
        <Breadcrumb
          className="mb-6"
          items={[
            { label: "Home", href: "/" },
            { label: "Departments" },
          ]}
        />

        <div className="mb-8 rounded-xl border border-border bg-card/50 p-4 sm:p-6">
          <Stepper steps={APPLICATION_STEPS} current={STEP_SELECT} />
        </div>

        <header className="mb-8 animate-fade-up">
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

          {/* Progress reflects committed (submitted) + in-progress (selected)
              applications against the per-user cap. */}
          <div className="mt-5 max-w-md">
            <Progress
              value={selectedCount + submittedCount}
              max={MAX_APPLICATIONS_PER_USER}
              label="Applications used"
              tone={isAtCap || noSlotsLeft ? "warning" : "primary"}
              showValue
            />
          </div>

          <div className="mt-5 grid gap-3 sm:max-w-2xl">
            <Alert variant="info">
              <AlertTitle>You can apply to up to {MAX_APPLICATIONS_PER_USER} departments</AlertTitle>
              <AlertDescription>
                Choose carefully — once an application is submitted its slot is
                used and cannot be reassigned.
              </AlertDescription>
            </Alert>

            {(isAtCap || noSlotsLeft) && (
              <Alert variant="warning">
                <AlertTitle>
                  {noSlotsLeft
                    ? "No application slots remaining"
                    : "You've reached the selection limit"}
                </AlertTitle>
                <AlertDescription>
                  {noSlotsLeft
                    ? "You have used all of your application slots. Deselect a submitted department is not possible."
                    : "Deselect a department before choosing a different one."}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* The countdown component is bound to the shared APPLICATION_DEADLINE,
              so this is the one place applicants see how long they have left. */}
          <div className="mt-6 inline-flex flex-col gap-2 rounded-xl border border-border bg-card px-5 py-4 shadow-sm">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Applications close in
            </span>
            <CountdownTimer />
          </div>

          {/* Inline continue button for md+ where the sticky bar is hidden. */}
          <div className="mt-6 hidden md:block">
            <Button onClick={goToApplication} disabled={isContinueDisabled}>
              Continue to application →
            </Button>
          </div>
        </header>

        <section aria-labelledby="available-departments">
          <h2
            id="available-departments"
            className="mb-4 font-display text-xl font-semibold"
          >
            Available Departments
          </h2>

          {hasDepartments ? (
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
          ) : (
            <div className="rounded-xl border border-border bg-card">
              <EmptyState
                icon={<Inbox className="h-6 w-6" aria-hidden="true" />}
                title="No departments are open right now"
                description="Recruitment hasn't opened any departments yet. Please check back later."
              />
            </div>
          )}
        </section>
      </div>

      {/* Sticky action bar for mobile so Continue is always reachable. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/80 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md md:hidden">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Badge variant="softMuted" size="sm">
              {selectedCount + submittedCount}/{MAX_APPLICATIONS_PER_USER}
            </Badge>
            <span className="text-sm text-muted-foreground">selected</span>
          </div>
          <Button onClick={goToApplication} disabled={isContinueDisabled}>
            Continue →
          </Button>
        </div>
      </div>

      <Footer />
    </main>
  );
};

export default DepartmentsListPage;
