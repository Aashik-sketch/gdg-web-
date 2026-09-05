import { NextResponse } from "next/server";
import { connect } from "@/lib/db";
import { requireUser } from "@/lib/authz";
import { APPLICATIONS_COLLECTION } from "@/lib/config";

export const dynamic = "force-dynamic";

/**
 * Whether the signed-in user has already applied to a given department.
 * The email is taken from the session, never from the query string.
 */
export async function GET(request) {
  const { user, response: authError } = await requireUser();
  if (authError) return authError;

  const department = new URL(request.url).searchParams.get("department");
  if (!department) {
    return NextResponse.json(
      { message: "A department is required" },
      { status: 400 },
    );
  }

  try {
    const db = await connect();
    const snapshot = await db
      .collection(APPLICATIONS_COLLECTION)
      .where("Email", "==", user.email)
      .where("Department", "==", department)
      .limit(1)
      .get();

    return NextResponse.json({ submitted: !snapshot.empty }, { status: 200 });
  } catch (error) {
    console.error("Error checking department submission:", error);
    return NextResponse.json(
      { message: "Database query failed" },
      { status: 500 },
    );
  }
}
