import { NextResponse } from "next/server";
import { connect, serializeFirestoreData } from "@/lib/db";
import { requireAdmin } from "@/lib/authz";
import { APPLICATIONS_COLLECTION } from "@/lib/config";

export const dynamic = "force-dynamic";

/**
 * Full applicant listing.
 *
 * Previously unauthenticated: an anonymous GET returned every applicant's name,
 * registration number, email, phone number and questionnaire answers.
 */
export async function GET() {
  const { response: authError } = await requireAdmin();
  if (authError) return authError;

  try {
    const db = await connect();
    const snapshot = await db.collection(APPLICATIONS_COLLECTION).get();
    const applicants = snapshot.docs.map((doc) => ({
      id: doc.id,
      _id: doc.id,
      ...serializeFirestoreData(doc.data()),
    }));

    return NextResponse.json({ applicants });
  } catch (error) {
    console.error("Error fetching applicants:", error);
    return NextResponse.json(
      { message: "Failed to fetch applicants" },
      { status: 500 },
    );
  }
}
