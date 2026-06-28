import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

beforeEach(() => {
  delete process.env.PUBLIC_TURNSTILE_SITE_KEY;
  delete process.env.TURNSTILE_SECRET_KEY;
  delete process.env.NODE_ENV;
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

// Dynamic import to get fresh module state after env setup
async function getTurnstile() {
  return await import("../turnstile");
}

describe("isTurnstileEnabled", () => {
  it("returns false when neither key is set", async () => {
    const { isTurnstileEnabled } = await getTurnstile();
    expect(isTurnstileEnabled()).toBe(false);
  });

  it("returns false when only site key is set", async () => {
    process.env.PUBLIC_TURNSTILE_SITE_KEY = "1x00000000000000000000AA";
    const { isTurnstileEnabled } = await getTurnstile();
    expect(isTurnstileEnabled()).toBe(false);
  });

  it("returns false when only secret key is set", async () => {
    process.env.TURNSTILE_SECRET_KEY = "0x0000000000000000000000000000000AA";
    const { isTurnstileEnabled } = await getTurnstile();
    expect(isTurnstileEnabled()).toBe(false);
  });

  it("returns true when both keys are set", async () => {
    process.env.PUBLIC_TURNSTILE_SITE_KEY = "1x00000000000000000000AA";
    process.env.TURNSTILE_SECRET_KEY = "0x0000000000000000000000000000000AA";
    const { isTurnstileEnabled } = await getTurnstile();
    expect(isTurnstileEnabled()).toBe(true);
  });
});

describe("turnstileWidgetHtml", () => {
  it("returns empty string when site key is not set", async () => {
    const { turnstileWidgetHtml } = await getTurnstile();
    expect(turnstileWidgetHtml()).toBe("");
  });

  it("returns widget HTML when site key is set", async () => {
    process.env.PUBLIC_TURNSTILE_SITE_KEY = "1x00000000000000000000AA";
    const { turnstileWidgetHtml } = await getTurnstile();
    const html = turnstileWidgetHtml();
    expect(html).toContain('data-turnstile-sitekey="1x00000000000000000000AA"');
    expect(html).toContain("challenges.cloudflare.com/turnstile/v0/api.js");
  });

  it("includes the site key in data attribute", async () => {
    process.env.PUBLIC_TURNSTILE_SITE_KEY = "test-key-123";
    const { turnstileWidgetHtml } = await getTurnstile();
    expect(turnstileWidgetHtml()).toContain('data-turnstile-sitekey="test-key-123"');
  });
});

describe("verifyTurnstileToken — production fails-closed", () => {
  it("returns { success: false } in production when Turnstile is not configured", async () => {
    process.env.NODE_ENV = "production";
    // No keys set
    const { verifyTurnstileToken } = await getTurnstile();
    const result = await verifyTurnstileToken("some-token");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Turnstile not configured");
  });

  it("returns { success: true } in development when Turnstile is not configured", async () => {
    process.env.NODE_ENV = "development";
    const { verifyTurnstileToken } = await getTurnstile();
    const result = await verifyTurnstileToken("some-token");
    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("returns { success: true } in test/CI when Turnstile is not configured", async () => {
    // No NODE_ENV set — defaults to undefined (not production)
    const { verifyTurnstileToken } = await getTurnstile();
    const result = await verifyTurnstileToken("some-token");
    expect(result.success).toBe(true);
  });
});

describe("verifyTurnstileToken — missing token", () => {
  it("returns error when token is null", async () => {
    process.env.PUBLIC_TURNSTILE_SITE_KEY = "1x00000000000000000000AA";
    process.env.TURNSTILE_SECRET_KEY = "0x0000000000000000000000000000000AA";
    const { verifyTurnstileToken } = await getTurnstile();
    const result = await verifyTurnstileToken(null);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Missing Turnstile token");
  });

  it("returns error when token is undefined", async () => {
    process.env.PUBLIC_TURNSTILE_SITE_KEY = "1x00000000000000000000AA";
    process.env.TURNSTILE_SECRET_KEY = "0x0000000000000000000000000000000AA";
    const { verifyTurnstileToken } = await getTurnstile();
    const result = await verifyTurnstileToken(undefined);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Missing Turnstile token");
  });
});

describe("verifyTurnstileToken — network verification", () => {
  it("returns success when Cloudflare verifies the token", async () => {
    process.env.PUBLIC_TURNSTILE_SITE_KEY = "1x00000000000000000000AA";
    process.env.TURNSTILE_SECRET_KEY = "0x0000000000000000000000000000000AA";

    const mockFetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const { verifyTurnstileToken } = await getTurnstile();
    const result = await verifyTurnstileToken("valid-token");

    expect(result.success).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      expect.objectContaining({
        method: "POST",
      })
    );
  });

  it("returns error with error-codes when Cloudflare rejects the token", async () => {
    process.env.PUBLIC_TURNSTILE_SITE_KEY = "1x00000000000000000000AA";
    process.env.TURNSTILE_SECRET_KEY = "0x0000000000000000000000000000000AA";

    const mockFetch = vi.fn().mockResolvedValue({
      json: () =>
        Promise.resolve({
          success: false,
          "error-codes": ["invalid-input-response"],
        }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const { verifyTurnstileToken } = await getTurnstile();
    const result = await verifyTurnstileToken("bad-token");

    expect(result.success).toBe(false);
    expect(result.error).toBe("invalid-input-response");
  });

  it("returns error when fetch throws", async () => {
    process.env.PUBLIC_TURNSTILE_SITE_KEY = "1x00000000000000000000AA";
    process.env.TURNSTILE_SECRET_KEY = "0x0000000000000000000000000000000AA";

    const mockFetch = vi.fn().mockRejectedValue(new Error("Network error"));
    vi.stubGlobal("fetch", mockFetch);

    const { verifyTurnstileToken } = await getTurnstile();
    const result = await verifyTurnstileToken("token");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Network error");
  });

  it("returns generic error when fetch throws a non-Error", async () => {
    process.env.PUBLIC_TURNSTILE_SITE_KEY = "1x00000000000000000000AA";
    process.env.TURNSTILE_SECRET_KEY = "0x0000000000000000000000000000000AA";

    const mockFetch = vi.fn().mockRejectedValue("string error");
    vi.stubGlobal("fetch", mockFetch);

    const { verifyTurnstileToken } = await getTurnstile();
    const result = await verifyTurnstileToken("token");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Turnstile verification request failed");
  });

  it("sends secret and token in the POST body", async () => {
    process.env.PUBLIC_TURNSTILE_SITE_KEY = "1x00000000000000000000AA";
    process.env.TURNSTILE_SECRET_KEY = "secret-key-here";

    const mockFetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const { verifyTurnstileToken } = await getTurnstile();
    await verifyTurnstileToken("my-token-value");

    const callBody = mockFetch.mock.calls[0][1].body;
    expect(callBody).toBeInstanceOf(URLSearchParams);
    expect(callBody.get("secret")).toBe("secret-key-here");
    expect(callBody.get("response")).toBe("my-token-value");
  });
});

describe("verifyTurnstileToken — production edge cases", () => {
  it("fails closed when secret key is missing in production even with valid token", async () => {
    process.env.NODE_ENV = "production";
    process.env.PUBLIC_TURNSTILE_SITE_KEY = "1x00000000000000000000AA";
    // No TURNSTILE_SECRET_KEY set

    const { verifyTurnstileToken } = await getTurnstile();
    const result = await verifyTurnstileToken("valid-token");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Turnstile not configured");
  });

  it("fails closed when only site key is set in production (no secret)", async () => {
    process.env.NODE_ENV = "production";
    process.env.PUBLIC_TURNSTILE_SITE_KEY = "1x00000000000000000000AA";
    // TURNSTILE_SECRET_KEY not set

    const { verifyTurnstileToken } = await getTurnstile();
    const result = await verifyTurnstileToken("anything");
    expect(result.success).toBe(false);
  });

  it("bypasses in production when both keys are present and token is valid", async () => {
    process.env.NODE_ENV = "production";
    process.env.PUBLIC_TURNSTILE_SITE_KEY = "1x00000000000000000000AA";
    process.env.TURNSTILE_SECRET_KEY = "0x0000000000000000000000000000000AA";

    const mockFetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const { verifyTurnstileToken } = await getTurnstile();
    const result = await verifyTurnstileToken("valid-token");
    expect(result.success).toBe(true);
  });
});

describe("getTurnstileSiteKey", () => {
  it("returns undefined when env var is not set", async () => {
    const { getTurnstileSiteKey } = await getTurnstile();
    expect(getTurnstileSiteKey()).toBeUndefined();
  });

  it("returns the site key when PUBLIC_TURNSTILE_SITE_KEY is set", async () => {
    process.env.PUBLIC_TURNSTILE_SITE_KEY = "test-key";
    const { getTurnstileSiteKey } = await getTurnstile();
    expect(getTurnstileSiteKey()).toBe("test-key");
  });
});
