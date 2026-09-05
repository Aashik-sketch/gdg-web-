import { describe, expect, it } from "vitest";
import { departments } from "@/constants/departments";
import {
  escapeHtml,
  formatZodError,
  sendEmailSchema,
  shortlistSchema,
  submitFormSchema,
} from "@/lib/validation";

const knownDepartmentId = departments[0].id;

const validBody = {
  Name: "Jane Doe",
  RegistrationNumber: "25BCE5612",
  Phone: "9876543210",
  DepartmentId: knownDepartmentId,
  Questions: { "Why do you want to join?": "Because I like building things." },
};

describe("submitFormSchema", () => {
  it("accepts a well-formed submission", () => {
    const result = submitFormSchema.safeParse(validBody);
    expect(result.success).toBe(true);
  });

  it("rejects a malformed registration number", () => {
    const result = submitFormSchema.safeParse({
      ...validBody,
      RegistrationNumber: "BCE25612",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a phone number that is not ten digits", () => {
    const result = submitFormSchema.safeParse({ ...validBody, Phone: "12345" });
    expect(result.success).toBe(false);
  });

  it("rejects a department id that is not in the catalogue", () => {
    const result = submitFormSchema.safeParse({
      ...validBody,
      DepartmentId: "not-a-real-id",
    });
    expect(result.success).toBe(false);
  });

  it("ignores a client-supplied Department name so it cannot be spoofed", () => {
    const result = submitFormSchema.safeParse({
      ...validBody,
      Department: "Totally Different Department",
    });
    expect(result.success).toBe(true);
    expect(result.data).not.toHaveProperty("Department");
  });

  it("rejects an unbounded answer", () => {
    const result = submitFormSchema.safeParse({
      ...validBody,
      Questions: { q: "x".repeat(5001) },
    });
    expect(result.success).toBe(false);
  });

  it("ignores a client-supplied Email so the session value always wins", () => {
    const result = submitFormSchema.safeParse({
      ...validBody,
      Email: "attacker@example.com",
    });
    expect(result.success).toBe(true);
    expect(result.data).not.toHaveProperty("Email");
  });

  it("ignores a client-supplied shortlisted flag", () => {
    const result = submitFormSchema.safeParse({ ...validBody, shortlisted: true });
    expect(result.success).toBe(true);
    expect(result.data).not.toHaveProperty("shortlisted");
  });

  it("trims surrounding whitespace", () => {
    const result = submitFormSchema.safeParse({ ...validBody, Name: "  Jane  " });
    expect(result.data.Name).toBe("Jane");
  });

  it("defaults Questions to an empty object", () => {
    const { Questions, ...withoutQuestions } = validBody;
    const result = submitFormSchema.safeParse(withoutQuestions);
    expect(result.success).toBe(true);
    expect(result.data.Questions).toEqual({});
  });
});

describe("sendEmailSchema", () => {
  const payloadData = { subject: "Interview", body: "<p>Hello #name</p>" };

  it("accepts a valid batch", () => {
    const result = sendEmailSchema.safeParse({
      recipients: [{ Email: "a@example.com", Name: "A", Department: "X" }],
      payloadData,
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty recipient list", () => {
    const result = sendEmailSchema.safeParse({ recipients: [], payloadData });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid recipient address", () => {
    const result = sendEmailSchema.safeParse({
      recipients: [{ Email: "not-an-email" }],
      payloadData,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing subject", () => {
    const result = sendEmailSchema.safeParse({
      recipients: [{ Email: "a@example.com" }],
      payloadData: { subject: "", body: "hi" },
    });
    expect(result.success).toBe(false);
  });

  it("caps the batch size", () => {
    const result = sendEmailSchema.safeParse({
      recipients: Array.from({ length: 501 }, (_, i) => ({
        Email: `user${i}@example.com`,
      })),
      payloadData,
    });
    expect(result.success).toBe(false);
  });
});

describe("shortlistSchema", () => {
  it("accepts a boolean", () => {
    expect(shortlistSchema.safeParse({ shortlisted: true }).success).toBe(true);
  });

  it("rejects a non-boolean", () => {
    expect(shortlistSchema.safeParse({ shortlisted: "yes" }).success).toBe(false);
  });
});

describe("escapeHtml", () => {
  it("neutralises markup injected through an applicant name", () => {
    expect(escapeHtml('<img src=x onerror="alert(1)">')).toBe(
      "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;",
    );
  });

  it("escapes ampersands and single quotes", () => {
    expect(escapeHtml("Tom & Jerry's")).toBe("Tom &amp; Jerry&#39;s");
  });

  it("renders null and undefined as an empty string", () => {
    expect(escapeHtml(null)).toBe("");
    expect(escapeHtml(undefined)).toBe("");
  });
});

describe("formatZodError", () => {
  it("joins every issue into one sentence", () => {
    const result = submitFormSchema.safeParse({});
    expect(result.success).toBe(false);
    const message = formatZodError(result.error);
    expect(message).toContain("Name");
    expect(message).toContain("RegistrationNumber");
  });
});
