import { NextResponse } from "next/server";
import { connect, serializeFirestoreData } from "@/lib/db";
import { requireAdmin } from "@/lib/authz";
import { APPLICATIONS_COLLECTION } from "@/lib/config";
import { formatZodError, shortlistSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

/**
 * Toggle an applicant's shortlisted flag.
 *
 * Two defects fixed here:
 *  1. The handler was unauthenticated, so anyone who could guess a document id
 *     could shortlist or un-shortlist any applicant.
 *  2. `docRef.update()` ran *before* the `snapshot.exists` check, so an unknown
 *     id threw NOT_FOUND and surfaced as a 400 -- the 404 branch was dead code.
 */
export async function PATCH(req, { params }) {
  const { response: authError } = await requireAdmin();
  if (authError) return authError;

  const id = params?.id;
  if (!id || typeof id !== "string") {
    return NextResponse.json(
      { success: false, message: "An applicant id is required" },
      { status: 400 },
    );
  }

  let json;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Request body must be valid JSON" },
      { status: 400 },
    );
  }

  const parsed = shortlistSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: formatZodError(parsed.error) },
      { status: 400 },
    );
  }

  try {
    const db = await connect();
    const docRef = db.collection(APPLICATIONS_COLLECTION).doc(id);

    // Read before write so a missing document is a 404 rather than a 400.
    const existing = await docRef.get();
    if (!existing.exists) {
      return NextResponse.json(
        { success: false, message: "Applicant not found" },
        { status: 404 },
      );
    }

    await docRef.update({ shortlisted: parsed.data.shortlisted });
    const snapshot = await docRef.get();

    return NextResponse.json({
      success: true,
      data: {
        id: snapshot.id,
        _id: snapshot.id,
        ...serializeFirestoreData(snapshot.data()),
      },
    });
  } catch (error) {
    console.error("Error updating applicant:", error);
    // Do not echo internal error text back to the client.
    return NextResponse.json(
      { success: false, message: "Failed to update applicant" },
      { status: 500 },
    );
  }
}
