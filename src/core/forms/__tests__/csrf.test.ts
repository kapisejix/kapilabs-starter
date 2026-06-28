import { describe, it, expect, vi } from "vitest";
import { generateCsrfToken, verifyCsrfToken } from "../csrf";

describe("generateCsrfToken", () => {
  it("returns a token and cookie", () => {
    const result = generateCsrfToken();

    expect(result.token).toBeTruthy();
    expect(result.cookie).toBeTruthy();
    expect(typeof result.token).toBe("string");
    expect(typeof result.cookie).toBe("string");
  });

  it("cookie contains required attributes", () => {
    const { cookie } = generateCsrfToken();

    expect(cookie).toContain("kapi_csrf=");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Strict");
    expect(cookie).toContain("Path=/");
    expect(cookie).toContain("Max-Age=86400");
  });

  it("token is a UUID (hex with dashes)", () => {
    const { token } = generateCsrfToken();
    // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    expect(token).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });

  it("generates unique tokens on successive calls", () => {
    const t1 = generateCsrfToken();
    const t2 = generateCsrfToken();
    expect(t1.token).not.toBe(t2.token);
    expect(t1.cookie).not.toBe(t2.cookie);
  });

  it("cookie value is in token.timestamp.signature format (3 parts)", () => {
    const { cookie } = generateCsrfToken();
    const cookieValue = cookie.split(";")[0].replace("kapi_csrf=", "");
    expect(cookieValue.split(".")).toHaveLength(3);
    // First part should be the UUID token
    expect(cookieValue.split(".")[0]).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });
});

describe("verifyCsrfToken — valid round-trip", () => {
  it("verifies a token generated in the same session", () => {
    const { token, cookie } = generateCsrfToken();

    // Pass the token as the form token, and the full cookie header
    const isValid = verifyCsrfToken(token, cookie);
    expect(isValid).toBe(true);
  });

  it("verifies token when there are other cookies present", () => {
    const { token, cookie } = generateCsrfToken();

    // Simulate a full Cookie header with multiple cookies
    const multiCookie = `session=abc123; other=cookie; ${cookie}`;
    expect(verifyCsrfToken(token, multiCookie)).toBe(true);
  });

  it("verifies 10 consecutive token generations", () => {
    for (let i = 0; i < 10; i++) {
      const { token, cookie } = generateCsrfToken();
      expect(verifyCsrfToken(token, cookie)).toBe(true);
    }
  });
});

describe("verifyCsrfToken — rejection cases", () => {
  it("rejects when form token is null", () => {
    const { cookie } = generateCsrfToken();
    expect(verifyCsrfToken(null, cookie)).toBe(false);
  });

  it("rejects when form token is undefined", () => {
    const { cookie } = generateCsrfToken();
    expect(verifyCsrfToken(undefined, cookie)).toBe(false);
  });

  it("rejects when cookie header is null", () => {
    const { token } = generateCsrfToken();
    expect(verifyCsrfToken(token, null)).toBe(false);
  });

  it("rejects when cookie header is undefined", () => {
    const { token } = generateCsrfToken();
    expect(verifyCsrfToken(token, undefined)).toBe(false);
  });

  it("rejects when form token does not match cookie token", () => {
    const t1 = generateCsrfToken();
    const t2 = generateCsrfToken();
    // Use token from t1 with cookie from t2
    expect(verifyCsrfToken(t1.token, t2.cookie)).toBe(false);
  });

  it("rejects when cookie has no kapi_csrf entry", () => {
    const { token } = generateCsrfToken();
    const noCsrfCookie = "session=abc; other=def";
    expect(verifyCsrfToken(token, noCsrfCookie)).toBe(false);
  });

  it("rejects empty string token", () => {
    const { cookie } = generateCsrfToken();
    expect(verifyCsrfToken("", cookie)).toBe(false);
  });
});

describe("verifyCsrfToken — tamper detection", () => {
  it("rejects when signature is tampered", () => {
    const { cookie } = generateCsrfToken();
    const cookieValue = cookie.split(";")[0].replace("kapi_csrf=", "");
    const parts = cookieValue.split(".");

    // Flip the last hex character of the signature
    const tamperedSig =
      parts[2].slice(0, -1) + (parts[2].slice(-1) === "a" ? "b" : "a");
    const tamperedCookieValue = `${parts[0]}.${parts[1]}.${tamperedSig}`;
    const tamperedCookie = `kapi_csrf=${tamperedCookieValue}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`;

    expect(verifyCsrfToken(parts[0], tamperedCookie)).toBe(false);
  });

  it("rejects when cookie value has wrong number of parts", () => {
    const { token } = generateCsrfToken();
    const badCookie = "kapi_csrf=only-two-parts; Path=/";
    expect(verifyCsrfToken(token, badCookie)).toBe(false);
  });

  it("rejects when timestamp is malformed (non-base36)", () => {
    const { cookie } = generateCsrfToken();
    const cookieValue = cookie.split(";")[0].replace("kapi_csrf=", "");
    const parts = cookieValue.split(".");
    const badCookieValue = `${parts[0]}.NOT-BASE36.${parts[2]}`;
    const badCookie = `kapi_csrf=${badCookieValue}; Path=/`;

    // parseInt("NOT-BASE36", 36) returns NaN, so age check fails
    expect(verifyCsrfToken(parts[0], badCookie)).toBe(false);
  });
});

describe("verifyCsrfToken — expiry", () => {
  it("rejects tokens older than 24 hours", () => {
    vi.useFakeTimers();

    // Generate a token at current time
    const { token, cookie } = generateCsrfToken();

    // Simulate parsing the cookie and modifying the timestamp
    const cookieValue = cookie.split(";")[0].replace("kapi_csrf=", "");
    const parts = cookieValue.split(".");

    // Set timestamp to 25 hours ago
    // Advance time by 25 hours and verify the original cookie fails
    vi.advanceTimersByTime(25 * 60 * 60 * 1000 + 1);

    // The original cookie should now be expired
    expect(verifyCsrfToken(token, cookie)).toBe(false);

    vi.useRealTimers();
  });

  it("accepts tokens within the 24-hour window", () => {
    vi.useFakeTimers();

    const { token, cookie } = generateCsrfToken();

    // Advance time by 23 hours (still within window)
    vi.advanceTimersByTime(23 * 60 * 60 * 1000);

    expect(verifyCsrfToken(token, cookie)).toBe(true);

    vi.useRealTimers();
  });

  it("rejects at exactly 24 hours + 1ms", () => {
    vi.useFakeTimers();

    const { token, cookie } = generateCsrfToken();

    // Advance time just past 24 hours
    vi.advanceTimersByTime(24 * 60 * 60 * 1000 + 1);

    expect(verifyCsrfToken(token, cookie)).toBe(false);

    vi.useRealTimers();
  });
});

describe("verifyCsrfToken — edge cases", () => {
  it("handles malformed cookie header", () => {
    const { token } = generateCsrfToken();
    expect(verifyCsrfToken(token, ";;;=;;")).toBe(false);
    expect(verifyCsrfToken(token, "=")).toBe(false);
    expect(verifyCsrfToken(token, "")).toBe(false);
  });

  it("handles cookie with empty kapi_csrf value", () => {
    const { token } = generateCsrfToken();
    expect(verifyCsrfToken(token, "kapi_csrf=; Path=/")).toBe(false);
  });

  it("handles multiple semicolons in cookie header", () => {
    const { token, cookie } = generateCsrfToken();
    const messyCookie = `;;; ${cookie} ;;`;
    expect(verifyCsrfToken(token, messyCookie)).toBe(true);
  });
});
