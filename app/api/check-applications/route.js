import { NextResponse } from "next/server";
import { connect } from "@/lib/db";
import { requireUser } from "@/lib/authz";
import { APPLICATIONS_COLLECTION, MAX_APPLICATIONS_PER_USER } from "@/lib/config";

export const dynamic = "force-dynamic";

/**
 * How many applications the signed-in user has submitted, and to which
 * departments.
 *
 * The email is taken from the session rather than the `email` query parameter.
 * The parameter is still accepted by callers but ignored, which removes the
 * "check that the param equals your own address" comparison entirely.
 */
export async function GET() {
  const { user, response: authError } = await requireUser();
  if (authError) return authError;

  try {
    const db = await connect();
    const snapshot = await db
      .collection(APPLICATIONS_COLLECTION)
      .where("Email", "==", user.email)
      .select("Department", "DepartmentId")
      .get();

    const docs = snapshot.docs.map((doc) => doc.data() ?? {});

    // Ids are authoritative. Names are returned too, for older records written
    // before ids were stored and for display.
    const submittedDepartmentIds = docs
      .map((data) => data.DepartmentId)
      .filter(Boolean);
    const submittedDepartments = docs.map((data) => data.Department).filter(Boolean);

    return NextResponse.json(
      {
        count: snapshot.size,
        submittedDepartmentIds,
        submittedDepartments,
        remaining: Math.max(0, MAX_APPLICATIONS_PER_USER - snapshot.size),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error checking applications:", error);
    return NextResponse.json(
      { message: "Failed to check applications" },
      { status: 500 },
    );
  }
}
