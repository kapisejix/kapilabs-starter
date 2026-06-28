import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  generateAdminToken,
  verifyAdminToken,
  getAdminTokenFromCookies,
  isAdminAuthorized,
} from "../admin-auth";

const TEST_ADMIN_KEY = "test-admin-key-12345";

beforeEach(() => {
  process.env.FORM_ADMIN_KEY = TEST_ADMIN_KEY;
});

afterEach(() => {
  delete process.env.FORM_ADMIN_KEY;
});

describe("generateAdminToken", () => {
  it("returns a token and cookie when FORM_ADMIN_KEY is set", () => {
    const result = generateAdminToken();

    expect(result.token).toBeTruthy();
    expect(result.cookie).toBeTruthy();
    expect(result.token).toContain(".");
    expect(result.cookie).toContain("kapi_admin=");
    expect(result.cookie).toContain("HttpOnly");
    expect(result.cookie).toContain("SameSite=Strict");
    expect(result.cookie).toContain("Max-Age=900");
  });

  it("token has exactly 3 dot-separated parts", () => {
    const { token } = generateAdminToken();
    const parts = token.split(".");
    expect(parts).toHaveLength(3);
  });

  it("returns empty token and cookie when FORM_ADMIN_KEY is not set", () => {
    delete process.env.FORM_ADMIN_KEY;
    const result = generateAdminToken();
    expect(result.token).toBe("");
    expect(result.cookie).toBe("");
  });

  it("generates unique tokens on successive calls", () => {
    const t1 = generateAdminToken();
    const t2 = generateAdminToken();
    expect(t1.token).not.toBe(t2.token);
  });

  it("cookie path is /", () => {
    const { cookie } = generateAdminToken();
    expect(cookie).toContain("Path=/");
  });
});

describe("verifyAdminToken", () => {
  it("verifies a freshly generated token", () => {
    const { token } = generateAdminToken();
    expect(verifyAdminToken(token)).toBe(true);
  });

  it("rejects null token", () => {
    expect(verifyAdminToken(null)).toBe(false);
  });

  it("rejects undefined token", () => {
    expect(verifyAdminToken(undefined)).toBe(false);
  });

  it("rejects empty string token", () => {
    expect(verifyAdminToken("")).toBe(false);
  });

  it("rejects token with wrong number of parts", () => {
    expect(verifyAdminToken("only-two-parts")).toBe(false);
    expect(verifyAdminToken("one")).toBe(false);
    expect(verifyAdminToken("a.b.c.d")).toBe(false);
  });

  it("rejects token with tampered signature", () => {
    const { token } = generateAdminToken();
    const parts = token.split(".");
    // Flip the last hex char of the signature
    const tamperedSig =
      parts[2].slice(0, -1) + (parts[2].slice(-1) === "a" ? "b" : "a");
    const tamperedToken = `${parts[0]}.${parts[1]}.${tamperedSig}`;
    expect(verifyAdminToken(tamperedToken)).toBe(false);
  });

  it("rejects token with tampered secret part", () => {
    const { token } = generateAdminToken();
    const parts = token.split(".");
    const tamperedToken = `deadbeef1234.${parts[1]}.${parts[2]}`;
    expect(verifyAdminToken(tamperedToken)).toBe(false);
  });

  it("rejects expired token (timestamp older than 900 seconds)", () => {
    const { token } = generateAdminToken();
    const parts = token.split(".");
    // Set timestamp to 1000 seconds ago (past the 900s limit)
    const oldTimestamp = Math.floor((Date.now() - 1_000_000) / 1000).toString(36);
    const expiredToken = `${parts[0]}.${oldTimestamp}.${parts[2]}`;
    expect(verifyAdminToken(expiredToken)).toBe(false);
  });

  it("returns false when FORM_ADMIN_KEY is not set", () => {
    delete process.env.FORM_ADMIN_KEY;
    const { token } = generateAdminToken();
    // generateAdminToken returns empty without the key
    expect(verifyAdminToken(token)).toBe(false);
  });
});

describe("getAdminTokenFromCookies", () => {
  it("extracts kapi_admin cookie value", () => {
    const { token, cookie } = generateAdminToken();
    const extracted = getAdminTokenFromCookies(cookie);
    expect(extracted).toBe(token);
  });

  it("extracts correctly from multi-cookie header", () => {
    const { token } = generateAdminToken();
    const multiCookie = `session=abc123; kapi_admin=${token}; other=val`;
    expect(getAdminTokenFromCookies(multiCookie)).toBe(token);
  });

  it("returns null when cookie header is null", () => {
    expect(getAdminTokenFromCookies(null)).toBeNull();
  });

  it("returns null when cookie header is undefined", () => {
    expect(getAdminTokenFromCookies(undefined)).toBeNull();
  });

  it("returns null when kapi_admin cookie is absent", () => {
    expect(getAdminTokenFromCookies("session=abc; other=def")).toBeNull();
  });

  it("handles malformed cookie header gracefully", () => {
    expect(getAdminTokenFromCookies(";;;=;;")).toBeNull();
  });
});

describe("isAdminAuthorized", () => {
  it("authorizes with correct header key", () => {
    expect(isAdminAuthorized(TEST_ADMIN_KEY, null)).toBe(true);
  });

  it("rejects with wrong header key", () => {
    expect(isAdminAuthorized("wrong-key", null)).toBe(false);
  });

  it("authorizes with valid session cookie", () => {
    const { token } = generateAdminToken();
    const cookieHeader = `kapi_admin=${token}`;
    expect(isAdminAuthorized(null, cookieHeader)).toBe(true);
  });

  it("prefers header key over cookie token", () => {
    const { token } = generateAdminToken();
    const cookieHeader = `kapi_admin=${token}`;
    // Even though the cookie is valid, the header is correct too
    expect(isAdminAuthorized(TEST_ADMIN_KEY, cookieHeader)).toBe(true);
  });

  it("rejects when both header and cookie are invalid", () => {
    const cookieHeader = "kapi_admin=bad-token";
    expect(isAdminAuthorized("wrong", cookieHeader)).toBe(false);
  });

  it("returns false when FORM_ADMIN_KEY is not set", () => {
    delete process.env.FORM_ADMIN_KEY;
    expect(isAdminAuthorized("anything", null)).toBe(false);
  });

  it("returns false when all inputs are null/undefined", () => {
    expect(isAdminAuthorized(null, null)).toBe(false);
    expect(isAdminAuthorized(null, undefined)).toBe(false);
  });
});
