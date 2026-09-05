import { NextResponse } from "next/server";
import { connect } from "@/lib/db";
import { requireUser } from "@/lib/authz";
import {
  APPLICATIONS_COLLECTION,
  MAX_APPLICATIONS_PER_USER,
  isDeadlinePassed,
} from "@/lib/config";
import { formatZodError, submitFormSchema } from "@/lib/validation";
import { DEPARTMENT_NAME_BY_ID } from "@/constants/departments";

export const dynamic = "force-dynamic";

/** Error carrying an HTTP status, so transaction logic can signal a 4xx. */
class SubmissionError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

/**
 * Create one application for the signed-in user.
 *
 * Changes from the original handler:
 *  - The deadline is no longer a hardcoded literal; it comes from lib/config
 *    (shared with the countdown timer) and is overridable via env.
 *  - The whole body is validated with zod. Previously only RegistrationNumber
 *    was checked, so Name/Phone/Pref/Questions were written unbounded.
 *  - The "at most N applications" and "no duplicate department" checks now run
 *    inside a Firestore transaction. The previous read-then-write allowed two
 *    concurrent requests to both pass the check and exceed the limit.
 *  - Email is still taken from the session, never from the request body.
 */
export async function POST(req) {
  const { user, response: authError } = await requireUser();
  if (authError) return authError;

  if (isDeadlinePassed()) {
    return NextResponse.json(
      { message: "The submission deadline has passed" },
      { status: 403 },
    );
  }

  let json;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json(
      { message: "Request body must be valid JSON" },
      { status: 400 },
    );
  }

  const parsed = submitFormSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { message: formatZodError(parsed.error) },
      { status: 400 },
    );
  }

  const { DepartmentId, Questions, ...formFields } = parsed.data;
  const userEmail = user.email;

  // The display name is derived on the server from the id, never taken from the
  // request, so a rename in constants/departmentNames.js cannot be spoofed and
  // stored records always carry the id that identifies the department.
  const departmentName = DEPARTMENT_NAME_BY_ID[DepartmentId] ?? DepartmentId;

  try {
    const db = await connect();
    const collection = db.collection(APPLICATIONS_COLLECTION);

    await db.runTransaction(async (tx) => {
      const existing = await tx.get(collection.where("Email", "==", userEmail));

      // Duplicate detection matches on the stable id. Older records written
      // before ids were stored are matched on the display name as a fallback.
      const alreadyApplied = existing.docs.some((doc) => {
        const data = doc.data() ?? {};
        return data.DepartmentId
          ? data.DepartmentId === DepartmentId
          : data.Department === departmentName;
      });

      if (alreadyApplied) {
        throw new SubmissionError(
          `You have already submitted an application for ${departmentName}`,
          409,
        );
      }

      if (existing.size >= MAX_APPLICATIONS_PER_USER) {
        throw new SubmissionError(
          `You can only submit up to ${MAX_APPLICATIONS_PER_USER} unique applications`,
          409,
        );
      }

      tx.create(collection.doc(), {
        ...formFields,
        DepartmentId,
        Department: departmentName,
        Questions,
        Email: userEmail,
        shortlisted: false,
        createdAt: new Date(),
      });
    });

    return NextResponse.json(
      { message: "Form submitted successfully!" },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof SubmissionError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status },
      );
    }
    console.error("Form submission error:", error);
    return NextResponse.json(
      { message: "Error submitting form" },
      { status: 500 },
    );
  }
}
