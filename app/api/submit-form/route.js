import { NextResponse } from "next/server";
import { connect } from "@/lib/db";
import { requireUser } from "@/lib/authz";
import {
  APPLICATIONS_COLLECTION,
  MAX_APPLICATIONS_PER_USER,
  isDeadlinePassed,
} from "@/lib/config";
import { formatZodError, submitFormSchema } from "@/lib/validation";

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

  const { Department, Questions, ...formFields } = parsed.data;
  const userEmail = user.email;

  try {
    const db = await connect();
    const collection = db.collection(APPLICATIONS_COLLECTION);

    await db.runTransaction(async (tx) => {
      const existing = await tx.get(collection.where("Email", "==", userEmail));

      if (existing.docs.some((doc) => doc.data()?.Department === Department)) {
        throw new SubmissionError(
          `You have already submitted an application for ${Department}`,
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
        Department,
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
