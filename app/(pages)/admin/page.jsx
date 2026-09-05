import React from "react";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import AdminContent from "@/components/AdminContent";
import { connect, serializeFirestoreData } from "@/lib/db";
import { getCurrentUser, isAdmin } from "@/lib/authz";
import { APPLICATIONS_COLLECTION } from "@/lib/config";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Console | Recruitment Portal",
  robots: { index: false, follow: false },
};

/**
 * Admin console.
 *
 * The role check runs here, on the server, *before* any applicant data is
 * fetched. Previously this component fetched every applicant unconditionally
 * and passed them to a client component that then checked the role -- so the
 * full dataset was already serialised into the RSC payload of any visitor who
 * merely saw "Access Denied".
 */
export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <NavBar />
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Authentication required
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in with an administrator account to open the admin console.
          </p>
          <Link
            href="/auth/signin"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Sign in
          </Link>
        </main>
      </div>
    );
  }

  if (!isAdmin(user)) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <NavBar />
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Access denied
          </h1>
          <p className="text-sm text-muted-foreground">
            Your account does not have administrator privileges.
          </p>
          <Link
            href="/"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Return to the portal
          </Link>
        </main>
      </div>
    );
  }

  const db = await connect();
  const snapshot = await db.collection(APPLICATIONS_COLLECTION).get();
  const applicants = snapshot.docs.map((doc) => ({
    id: doc.id,
    _id: doc.id,
    ...serializeFirestoreData(doc.data()),
  }));

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <NavBar />
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <AdminContent applicants={applicants} />
      </main>
    </div>
  );
}
