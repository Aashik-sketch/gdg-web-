import * as z from "zod";
import { reviews } from "@/constants";

/**
 * Server-side request validation.
 *
 * The zod schema in components/FormComp.jsx only ever ran in the browser, so
 * /api/submit-form accepted arbitrary Name/Phone/Pref/Questions values of any
 * length. These schemas are the authoritative check.
 */

/** Registration numbers look like 25BCE5612: 2 digits, 3 uppercase letters, 4 digits. */
export const REGISTRATION_NUMBER_REGEX = /^\d{2}[A-Z]{3}\d{4}$/;

/** Exactly ten digits, optionally prefixed with +91 or 0. */
export const PHONE_REGEX = /^(?:\+91|0)?\d{10}$/;

/** Department names that actually exist in the catalogue. */
export const KNOWN_DEPARTMENT_NAMES = reviews
  .map((department) => department?.name)
  .filter((name) => typeof name === "string" && name.length > 0);

const MAX_ANSWER_LENGTH = 5000;
const MAX_QUESTION_COUNT = 40;

const trimmedString = (max) =>
  z
    .string()
    .transform((value) => value.trim())
    .pipe(z.string().max(max));

/** Body accepted by POST /api/submit-form. */
export const submitFormSchema = z.object({
  Name: trimmedString(120).pipe(z.string().min(1, "Name is required")),
  RegistrationNumber: trimmedString(16)
    .pipe(
      z
        .string()
        .regex(
          REGISTRATION_NUMBER_REGEX,
          "Registration number must be 2 digits, 3 uppercase letters, then 4 digits (e.g. 25BCE5612)",
        ),
    ),
  Phone: trimmedString(16).pipe(
    z.string().regex(PHONE_REGEX, "Phone number must be exactly 10 digits"),
  ),
  Department: z
    .string()
    .refine(
      (value) => KNOWN_DEPARTMENT_NAMES.includes(value),
      "Unknown department",
    ),
  Gender: trimmedString(40).optional(),
  "Year of Study": trimmedString(40).optional(),
  Pref: trimmedString(120).optional(),
  Questions: z
    .record(z.string().max(300), z.string().max(MAX_ANSWER_LENGTH))
    .refine(
      (value) => Object.keys(value).length <= MAX_QUESTION_COUNT,
      `A submission may contain at most ${MAX_QUESTION_COUNT} answers`,
    )
    .optional()
    .default({}),
});

/** Body accepted by POST /api/send-email. */
export const sendEmailSchema = z.object({
  recipients: z
    .array(
      z.object({
        Email: z.string().email("Recipient email is invalid"),
        Name: trimmedString(120).optional().default(""),
        Department: trimmedString(120).optional().default(""),
      }),
    )
    .min(1, "At least one recipient is required")
    .max(500, "At most 500 recipients per request"),
  payloadData: z.object({
    subject: trimmedString(200).pipe(
      z.string().min(1, "A subject is required"),
    ),
    body: z.string().min(1, "A body is required").max(100_000),
  }),
});

/** Body accepted by PATCH /api/shortlist/[id]. */
export const shortlistSchema = z.object({
  shortlisted: z.boolean({
    required_error: "shortlisted is required",
    invalid_type_error: "shortlisted must be a boolean",
  }),
});

const HTML_ESCAPES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/**
 * Escape a value for interpolation into an HTML document.
 *
 * Applicant-controlled fields (Name, Department) are substituted into the
 * outgoing mail template; without escaping, an applicant could inject markup
 * into every recruiter-sent email.
 */
export const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);

/**
 * Flatten a zod error into a single human-readable sentence.
 * @param {import("zod").ZodError} error
 */
export const formatZodError = (error) =>
  error.issues
    .map((issue) => {
      const path = issue.path.join(".");
      return path ? `${path}: ${issue.message}` : issue.message;
    })
    .join("; ");
