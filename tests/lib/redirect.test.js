import { describe, expect, it } from "vitest";
import {
  DEFAULT_RETURN_PATH,
  isSafeReturnPath,
  sanitiseReturnPath,
  signInHref,
} from "@/lib/redirect";

describe("isSafeReturnPath", () => {
  it("accepts an absolute internal path", () => {
    expect(isSafeReturnPath("/join/abc")).toBe(true);
    expect(isSafeReturnPath("/departments")).toBe(true);
  });

  it("rejects an absolute URL to another origin", () => {
    expect(isSafeReturnPath("https://evil.example.com")).toBe(false);
    expect(isSafeReturnPath("http://evil.example.com/x")).toBe(false);
  });

  it("rejects a protocol-relative URL", () => {
    expect(isSafeReturnPath("//evil.example.com")).toBe(false);
    expect(isSafeReturnPath("/\\evil.example.com")).toBe(false);
  });

  it("rejects a backslash, which some browsers normalise to a separator", () => {
    expect(isSafeReturnPath("/foo\\bar")).toBe(false);
  });

  it("rejects control characters", () => {
    expect(isSafeReturnPath("/foo\nbar")).toBe(false);
    expect(isSafeReturnPath("/foo\u0000bar")).toBe(false);
  });

  it("rejects a relative path and non-strings", () => {
    expect(isSafeReturnPath("departments")).toBe(false);
    expect(isSafeReturnPath(null)).toBe(false);
    expect(isSafeReturnPath(undefined)).toBe(false);
    expect(isSafeReturnPath(123)).toBe(false);
  });

  it("rejects a javascript: scheme", () => {
    expect(isSafeReturnPath("javascript:alert(1)")).toBe(false);
  });
});

describe("sanitiseReturnPath", () => {
  it("passes a safe path through", () => {
    expect(sanitiseReturnPath("/join/abc")).toBe("/join/abc");
  });

  it("falls back to the default for anything unsafe", () => {
    expect(sanitiseReturnPath("https://evil.example.com")).toBe(
      DEFAULT_RETURN_PATH,
    );
    expect(sanitiseReturnPath("//evil.example.com")).toBe(DEFAULT_RETURN_PATH);
    expect(sanitiseReturnPath(null)).toBe(DEFAULT_RETURN_PATH);
  });

  it("honours an explicit fallback", () => {
    expect(sanitiseReturnPath("bad", "/departments")).toBe("/departments");
  });
});

describe("signInHref", () => {
  it("encodes the return path", () => {
    expect(signInHref("/join/a/b")).toBe(
      `/auth/signin?next=${encodeURIComponent("/join/a/b")}`,
    );
  });

  it("omits the parameter for the default destination", () => {
    expect(signInHref("/")).toBe("/auth/signin");
  });

  it("omits the parameter for an unsafe destination", () => {
    expect(signInHref("https://evil.example.com")).toBe("/auth/signin");
    expect(signInHref(undefined)).toBe("/auth/signin");
  });
});
