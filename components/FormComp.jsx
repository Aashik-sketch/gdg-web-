"use client";

import React, { useEffect, useMemo, useState } from "react";
import * as z from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "./ui/form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Spinner } from "./ui/spinner";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useSubmissions } from "@/components/SubmissionsProvider";
import { Check } from "lucide-react";

// Neutral label used in place of the previous "Why do you want to join
// Organization Name?" placeholder copy.
const MOTIVATION_QUESTION = "Why do you want to join?";

// Legacy motivation-question labels that the department questionnaires still
// contain and that must not be rendered twice (they are shown once as the
// shared motivation field).
const MOTIVATION_ALIASES = new Set([
  MOTIVATION_QUESTION,
  "Why do you want to join Organization Name?",
  "Why do you want to join DWASFW?",
]);

/**
 * Render one department's questionnaire.
 *
 * Questions arrive attached to the department object (resolved by stable id in
 * constants/departments.js). They used to be looked up here by matching the
 * display NAME against QuestionnaireData, which meant renaming a department
 * silently removed all of its questions.
 *
 * @param {{id:string, name:string, questions:Array}} department
 */
const renderDepartmentQuestions = (department, form) => {
  const questions = (department?.questions ?? []).filter(
    (question) => !MOTIVATION_ALIASES.has(question.name),
  );

  if (!questions.length) return null;

  return (
    <Card className="animate-fade-up">
      <CardHeader>
        <CardTitle
          className="break-words font-display text-lg"
          title={department.name}
        >
          <span className="line-clamp-2">{department.name}</span>
        </CardTitle>
        <CardDescription>Questions specific to this department.</CardDescription>
      </CardHeader>
      <CardContent>
        <fieldset>
          <legend className="sr-only">{department.name} questions</legend>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {questions.map((question) => {
              const isCompact = question.type === "short-text";
              return (
                <FormField
                  key={question.name}
                  control={form.control}
                  name={question.name}
                  render={({ field, fieldState }) => {
                    const errorId = `${field.name}-error`;
                    return (
                      <FormItem className={isCompact ? "" : "md:col-span-2"}>
                        <FormLabel className="break-words">{question.name}</FormLabel>
                        <FormControl>
                          {isCompact ? (
                            <Input
                              {...field}
                              placeholder={question.placeholder || "Answer..."}
                              aria-invalid={fieldState.error ? "true" : undefined}
                              aria-describedby={fieldState.error ? errorId : undefined}
                            />
                          ) : (
                            <Textarea
                              {...field}
                              rows={4}
                              placeholder={question.placeholder || "2-3 sentences"}
                              aria-invalid={fieldState.error ? "true" : undefined}
                              aria-describedby={fieldState.error ? errorId : undefined}
                            />
                          )}
                        </FormControl>
                        <FormMessage id={errorId} />
                      </FormItem>
                    );
                  }}
                />
              );
            })}
          </div>
        </fieldset>
      </CardContent>
    </Card>
  );
};

const FormComp = ({ departments = [] }) => {
  const { data: session, isPending } = authClient.useSession();

  const user = session?.user;
  const isSignedIn = !!user;
  const isLoaded = !isPending;

  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const {
    submittedDepartmentIds: contextSubmittedIds,
    markDepartmentsSubmitted,
  } = useSubmissions();
  const [submittedDepartments, setSubmittedDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDraftReady, setIsDraftReady] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  const selectedDepartments = useMemo(
    () => departments.filter(Boolean),
    [departments],
  );
  const departmentIds = useMemo(
    () => selectedDepartments.map((department) => department.id),
    [selectedDepartments],
  );
  const departmentNames = useMemo(
    () => selectedDepartments.map((department) => department.name),
    [selectedDepartments],
  );

  // The draft key is derived from stable ids, so renaming a department does not
  // orphan a saved draft.
  const draftKey =
    user?.email && departmentIds.length
      ? `recruitment-draft:${user.email}:${[...departmentIds].sort().join("|")}`
      : null;

  const questionData = useMemo(
    () => [
      ...new Set(
        selectedDepartments.flatMap((department) =>
          (department.questions ?? [])
            .map((question) => question.name)
            .filter((name) => !MOTIVATION_ALIASES.has(name)),
        ),
      ),
    ],
    [selectedDepartments],
  );

  const formSchema = useMemo(() => {
    const schemaObj = {
      Name: z.string().min(1, "Name is required"),
      RegistrationNumber: z
        .string()
        .min(1, "Registration number is required")
        .regex(
          /^\d{2}[A-Z]{3}\d{4}$/,
          "Registration number must be 2 numbers, 3 uppercase letters, and 4 numbers (e.g. 25BCE5612)",
        ),
      // Phone must match the server contract: exactly 10 digits, optionally
      // prefixed with +91 or 0.
      Phone: z
        .string()
        .min(1, "Phone is required")
        .regex(
          /^(?:\+91|0)?\d{10}$/,
          "Phone number must be 10 digits, optionally prefixed with +91 or 0",
        ),
      Gender: z.string().optional(),
      "Year of Study": z.string().optional(),
      [MOTIVATION_QUESTION]: z.string().optional(),
    };
    questionData.forEach((qd) => {
      schemaObj[qd] = z.string().optional();
    });
    return z.object(schemaObj);
  }, [questionData]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      Name: "",
      RegistrationNumber: "",
      Phone: "",
      Gender: "",
    },
  });

  // Load any saved draft and reconcile it with the already-submitted
  // departments reported by SubmissionsProvider. No network call happens here.
  useEffect(() => {
    if (!isLoaded || !user || !draftKey) return;

    setIsDraftReady(false);

    try {
      const savedDraft = JSON.parse(localStorage.getItem(draftKey) || "{}");
      form.reset({ ...form.getValues(), ...savedDraft.values });
    } catch {
      // Ignore malformed drafts.
    }

    // SubmissionsProvider is the single source of truth for what has already
    // been submitted (it fetches /api/check-applications and caches it). This
    // component used to repeat that fetch and maintain a second sessionStorage
    // cache under a different key, so the two could disagree.
    const savedDraftIds = (() => {
      try {
        const draft = JSON.parse(localStorage.getItem(draftKey) || "{}");
        return Array.isArray(draft.submittedDepartments)
          ? draft.submittedDepartments
          : [];
      } catch {
        return [];
      }
    })();

    const completed = [...new Set([...savedDraftIds, ...contextSubmittedIds])];
    setSubmittedDepartments(completed);

    if (
      departmentIds.length > 0 &&
      departmentIds.every((id) => completed.includes(id))
    ) {
      setErrorMessage(
        `You have already submitted an application for ${departmentNames.join(" and ")}.`,
      );
    }

    localStorage.setItem(
      draftKey,
      JSON.stringify({ values: form.getValues(), submittedDepartments: completed }),
    );
    setLoading(false);
    setIsDraftReady(true);
  }, [
    contextSubmittedIds,
    departmentIds,
    departmentNames,
    draftKey,
    form,
    isLoaded,
    user,
  ]);

  const watchedValues = useWatch({ control: form.control });

  // Persist the draft, but debounce so we write at most every ~500ms instead of
  // serialising the entire form on every keystroke. The pending timer is
  // cleared on unmount / dependency change.
  useEffect(() => {
    if (!isDraftReady || !draftKey) return;
    const handle = setTimeout(() => {
      localStorage.setItem(
        draftKey,
        JSON.stringify({ values: watchedValues, submittedDepartments }),
      );
      // Reflect the successful debounced write in the UI ("Saved automatically").
      setDraftSaved(true);
    }, 500);
    return () => clearTimeout(handle);
  }, [draftKey, isDraftReady, submittedDepartments, watchedValues]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-muted-foreground">
        <Spinner size="lg" label="Loading application" />
        <p>Loading…</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="max-w-md text-center">
          <CardHeader>
            <CardTitle className="font-display text-2xl">Sign In Required</CardTitle>
            <CardDescription>
              Please sign in to access the application form.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => router.push("/auth/signin")}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    setErrorMessage("");

    // Pending work is tracked by id, so a rename cannot make an already
    // submitted department look outstanding.
    const pendingDepartments = selectedDepartments.filter(
      (department) => !submittedDepartments.includes(department.id),
    );

    if (!pendingDepartments.length) {
      toast.success("Your applications have already been submitted.");
      setIsSubmitting(false);
      router.push("/departments");
      return;
    }

    // Email is intentionally NOT sent -- the server rejects a client-supplied
    // Email and derives it from the session.
    const basicDetails = {
      Name: values.Name,
      RegistrationNumber: values.RegistrationNumber,
      Phone: values.Phone,
      Gender: values.Gender,
      "Year of Study": values["Year of Study"],
    };

    const submitDepartment = async (department) => {
      const questions = department.questions ?? [];

      const answers = questions.reduce(
        (acc, question) => ({
          ...acc,
          [question.name]: MOTIVATION_ALIASES.has(question.name)
            ? values[MOTIVATION_QUESTION] || ""
            : values[question.name] || "",
        }),
        {},
      );

      const response = await fetch("/api/submit-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...basicDetails,
          // The id is authoritative; the server derives the display name from
          // it and rejects a client-supplied name.
          DepartmentId: department.id,
          Questions: answers,
        }),
      });

      // 201 on success. 400/403/409 carry a server `message` we surface as-is.
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Could not submit ${department.name}.`);
      }
      return { department, success: true };
    };

    try {
      const results = await Promise.allSettled(
        pendingDepartments.map(submitDepartment),
      );
      const successful = results
        .filter((result) => result.status === "fulfilled" && result.value.success)
        .map((result) => result.value.department);
      const failures = results.flatMap((result, index) =>
        result.status === "rejected"
          ? [
              {
                department: pendingDepartments[index].name,
                message: result.reason?.message,
              },
            ]
          : [],
      );
      const completed = [
        ...new Set([...submittedDepartments, ...successful.map((d) => d.id)]),
      ];

      setSubmittedDepartments(completed);
      markDepartmentsSubmitted({
        ids: successful.map((d) => d.id),
        names: successful.map((d) => d.name),
      });
      if (draftKey) {
        localStorage.setItem(
          draftKey,
          JSON.stringify({ values, submittedDepartments: completed }),
        );
      }
      successful.forEach((department) =>
        toast.success(`Application submitted for ${department.name}.`),
      );

      if (failures.length) {
        // Surface the server's message for each failed department.
        setErrorMessage(
          failures
            .map((f) => `${f.department}: ${f.message || "Could not submit."}`)
            .join(" "),
        );
      } else {
        router.push("/departments");
      }
    } catch {
      setErrorMessage(
        "Your applications could not be submitted. Your saved answers will be kept for retrying.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-muted-foreground">
        <Spinner label="Checking application status" />
        <p>Checking your application status…</p>
      </div>
    );
  }

  // Required-field completion drives a small progress indicator so applicants
  // can see the essential fields are done. These three are the only hard
  // requirements in the schema (Name, RegistrationNumber, Phone).
  const requiredFields = ["Name", "RegistrationNumber", "Phone"];
  const filledRequired = requiredFields.filter(
    (name) => (watchedValues?.[name] || "").toString().trim().length > 0,
  ).length;

  return (
    <div className="mx-auto w-full max-w-3xl">
      {errorMessage && !isSubmitting && (
        <Alert variant="destructive" className="mb-6">
          <div className="min-w-0 flex-1">
            <AlertTitle>We couldn&apos;t submit your application</AlertTitle>
            <AlertDescription className="break-words text-destructive/90">
              {errorMessage}
            </AlertDescription>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => router.push("/departments")}
            >
              Go Back
            </Button>
          </div>
        </Alert>
      )}

      <header className="mb-6 animate-fade-up">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Step 02 · Apply
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground">
          Application Form
        </h1>
        <p className="mt-2 break-words text-muted-foreground">
          Applying to:{" "}
          <strong className="text-foreground">{departmentNames.join(", ")}</strong>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Fields marked <span className="text-destructive">*</span> are required.
        </p>

        <div className="mt-5 flex flex-col gap-2 sm:max-w-md">
          <Progress
            value={filledRequired}
            max={requiredFields.length}
            label="Required details completed"
            tone={filledRequired === requiredFields.length ? "success" : "primary"}
            showValue
          />
          {draftSaved && (
            <Badge variant="softMuted" size="sm" className="w-fit">
              <Check className="h-3 w-3" aria-hidden="true" />
              Saved automatically
            </Badge>
          )}
        </div>
      </header>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6" noValidate>
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">About You</CardTitle>
              <CardDescription>
                These details are shared across every department you apply to.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <fieldset>
                <legend className="sr-only">About you</legend>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <FormField
                control={form.control}
                name="Name"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>
                      Full Name <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Jane Doe"
                        aria-invalid={fieldState.error ? "true" : undefined}
                        aria-describedby={fieldState.error ? "Name-error" : undefined}
                      />
                    </FormControl>
                    <FormMessage id="Name-error" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="RegistrationNumber"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>
                      Registration Number <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g. 25BCE5612"
                        aria-invalid={fieldState.error ? "true" : undefined}
                        aria-describedby={
                          fieldState.error ? "RegistrationNumber-error" : undefined
                        }
                      />
                    </FormControl>
                    <FormMessage id="RegistrationNumber-error" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="Gender"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel htmlFor="gender-select">Gender</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        id="gender-select"
                        value={field.value || ""}
                        aria-invalid={fieldState.error ? "true" : undefined}
                        className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="" disabled>
                          Select Gender
                        </option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email is display-only; it is derived from the session and is
                  never submitted to the API. */}
              <FormItem>
                <Label htmlFor="email-readonly">Email Address</Label>
                <Input
                  id="email-readonly"
                  type="email"
                  value={user?.email || ""}
                  readOnly
                  aria-readonly="true"
                />
              </FormItem>

              <FormField
                control={form.control}
                name="Phone"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>
                      Phone (WhatsApp) <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        inputMode="tel"
                        placeholder="9876543210"
                        aria-invalid={fieldState.error ? "true" : undefined}
                        aria-describedby={fieldState.error ? "Phone-error" : undefined}
                      />
                    </FormControl>
                    <FormMessage id="Phone-error" />
                  </FormItem>
                )}
              />
            </div>

            <div className="mt-5">
              <FormField
                control={form.control}
                name={MOTIVATION_QUESTION}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{MOTIVATION_QUESTION}</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={4} placeholder="2-3 sentences" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
              </fieldset>
            </CardContent>
          </Card>

          {selectedDepartments.map((department) => (
            <React.Fragment key={department.id}>
              {renderDepartmentQuestions(department, form)}
            </React.Fragment>
          ))}

          <div className="pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="min-w-[12rem]"
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" label="Submitting" className="mr-2" />
                  <span aria-hidden="true">Submitting…</span>
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default FormComp;
