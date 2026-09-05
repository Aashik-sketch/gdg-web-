import { NextResponse } from "next/server";
import { connect, serializeFirestoreData } from "@/lib/db";
import { requireUser } from "@/lib/authz";
import { APPLICATIONS_COLLECTION } from "@/lib/config";

export const dynamic = "force-dynamic";

/**
 * The signed-in user's own submissions, in full.
 * The email is taken from the session, never from the query string.
 */
export async function GET() {
  const { user, response: authError } = await requireUser();
  if (authError) return authError;

  try {
    const db = await connect();
    const snapshot = await db
      .collection(APPLICATIONS_COLLECTION)
      .where("Email", "==", user.email)
      .get();

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      _id: doc.id,
      ...serializeFirestoreData(doc.data()),
    }));

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { message: "Failed to fetch submissions" },
      { status: 500 },
    );
  }
}
