import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { requireAdmin } from "@/lib/authz";
import {
  escapeHtml,
  formatZodError,
  sendEmailSchema,
} from "@/lib/validation";

export const dynamic = "force-dynamic";

/**
 * Bulk mail endpoint.
 *
 * Previously this handler had no authentication whatsoever: any anonymous
 * caller could POST a recipient list and raw HTML body and have it delivered
 * from the organisation's mailbox. It is now admin-only, schema-validated,
 * escapes applicant-controlled fields, and reports per-recipient failures
 * instead of aborting the batch on the first error.
 */

let cachedTransporter = null;

const getTransporter = () => {
  const user = process.env.EMAIL_USERNAME;
  const pass = process.env.EMAIL_PASSWORD;
  if (!user || !pass) return null;

  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
      pool: true,
      maxConnections: 3,
      maxMessages: 50,
    });
  }
  return cachedTransporter;
};

/**
 * Map a stored department value onto the display name used in emails.
 * Returns the raw value when the department is not in the catalogue, rather
 * than throwing (the previous implementation dereferenced `undefined.name`,
 * which aborted the whole batch mid-send).
 */
const resolveDepartmentLabel = (department) => {
  const value = String(department ?? "").trim();
  if (!value) return "your department";
  return value;
};

/** Render the outgoing HTML for one recipient. */
const renderTemplate = (bodyHtml, recipient) =>
  bodyHtml
    .replace(/#name/g, escapeHtml(recipient.Name || "there"))
    .replace(/#dept/g, escapeHtml(resolveDepartmentLabel(recipient.Department)));

/** Send with limited concurrency so a large batch cannot exhaust the SMTP pool. */
const sendWithConcurrency = async (tasks, limit = 3) => {
  const results = new Array(tasks.length);
  let cursor = 0;

  const worker = async () => {
    while (cursor < tasks.length) {
      const index = cursor++;
      try {
        await tasks[index]();
        results[index] = { ok: true };
      } catch (error) {
        results[index] = { ok: false, error };
      }
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(limit, tasks.length) }, worker),
  );
  return results;
};

export async function POST(req) {
  const { response: authError } = await requireAdmin();
  if (authError) return authError;

  let json;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json(
      { message: "Request body must be valid JSON" },
      { status: 400 },
    );
  }

  const parsed = sendEmailSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { message: formatZodError(parsed.error) },
      { status: 400 },
    );
  }

  const transporter = getTransporter();
  if (!transporter) {
    console.error("EMAIL_USERNAME / EMAIL_PASSWORD are not configured");
    return NextResponse.json(
      { message: "Email delivery is not configured on this server" },
      { status: 503 },
    );
  }

  const { recipients, payloadData } = parsed.data;
  const from = process.env.EMAIL_USERNAME;

  const results = await sendWithConcurrency(
    recipients.map((recipient) => () =>
      transporter.sendMail({
        from,
        to: recipient.Email,
        subject: payloadData.subject,
        html: renderTemplate(payloadData.body, recipient),
      }),
    ),
  );

  const failed = results
    .map((result, index) => (result.ok ? null : recipients[index].Email))
    .filter(Boolean);
  const sent = recipients.length - failed.length;

  if (failed.length) {
    console.error(`Failed to send ${failed.length} of ${recipients.length} emails`);
  }

  return NextResponse.json(
    {
      message: failed.length
        ? `Sent ${sent} of ${recipients.length} emails.`
        : "Emails sent successfully",
      sent,
      failed,
    },
    { status: failed.length && sent === 0 ? 502 : 200 },
  );
}
