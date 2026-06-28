import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { rateLimit, retryAfterHeader, resetRateLimits } from "../rateLimiter";

/**
 * Create a mock Request with the given IP header.
 */
function mockRequest(ip: string, headerName = "x-forwarded-for"): Request {
  return {
    headers: {
      get(name: string): string | null {
        if (name === headerName) return ip;
        if (name === "cf-connecting-ip") return null;
        if (name === "x-real-ip") return null;
        return null;
      },
    },
  } as unknown as Request;
}

beforeEach(() => {
  resetRateLimits();
});

afterEach(() => {
  resetRateLimits();
});

describe("rateLimit — basic acceptance", () => {
  it("allows first request in a namespace", () => {
    const req = mockRequest("1.2.3.4");
    const result = rateLimit("forms-submit", req);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(9);
    expect(result.resetMs).toBeGreaterThan(0);
  });

  it("allows requests up to the limit", () => {
    const req = mockRequest("1.2.3.4");
    for (let i = 0; i < 10; i++) {
      const result = rateLimit("forms-submit", req);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9 - i);
    }
  });
});

describe("rateLimit — limit exceeded", () => {
  it("blocks the 11th request in forms-submit (limit 10)", () => {
    const req = mockRequest("1.2.3.4");
    for (let i = 0; i < 10; i++) {
      rateLimit("forms-submit", req);
    }
    const result = rateLimit("forms-submit", req);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("blocks the 6th request in newsletter-subscribe (limit 5)", () => {
    const req = mockRequest("1.2.3.4");
    for (let i = 0; i < 5; i++) {
      rateLimit("newsletter-subscribe", req);
    }
    const result = rateLimit("newsletter-subscribe", req);
    expect(result.allowed).toBe(false);
  });

  it("returns a positive resetMs when blocked", () => {
    const req = mockRequest("1.2.3.4");
    for (let i = 0; i < 10; i++) {
      rateLimit("forms-submit", req);
    }
    const result = rateLimit("forms-submit", req);
    expect(result.allowed).toBe(false);
    expect(result.resetMs).toBeGreaterThan(0);
    expect(result.resetMs).toBeLessThanOrEqual(60_000);
  });
});

describe("rateLimit — per-IP isolation", () => {
  it("tracks different IPs independently", () => {
    const reqA = mockRequest("10.0.0.1");
    const reqB = mockRequest("10.0.0.2");

    // Exhaust IP A
    for (let i = 0; i < 10; i++) {
      rateLimit("forms-submit", reqA);
    }
    expect(rateLimit("forms-submit", reqA).allowed).toBe(false);

    // IP B should start fresh — first call counts as 1 request
    const result = rateLimit("forms-submit", reqB);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(9);
  });

  it("isolates different namespaces", () => {
    const req = mockRequest("1.2.3.4");

    // Exhaust forms-submit
    for (let i = 0; i < 10; i++) {
      rateLimit("forms-submit", req);
    }
    expect(rateLimit("forms-submit", req).allowed).toBe(false);

    // Different namespace unaffected
    expect(rateLimit("newsletter-subscribe", req).allowed).toBe(true);
  });
});

describe("rateLimit — IP header priority", () => {
  it("uses cf-connecting-ip first", () => {
    const req = {
      headers: {
        get(name: string): string | null {
          if (name === "cf-connecting-ip") return "203.0.113.1";
          if (name === "x-forwarded-for") return "1.1.1.1";
          if (name === "x-real-ip") return "10.0.0.1";
          return null;
        },
      },
    } as unknown as Request;

    // First request from cf-connecting-ip
    rateLimit("forms-submit", req);
    const result = rateLimit("forms-submit", req);
    expect(result.remaining).toBe(8); // used 2 out of 10
  });

  it("falls back to x-real-ip when others are absent", () => {
    const req = {
      headers: {
        get(name: string): string | null {
          if (name === "x-real-ip") return "10.0.0.5";
          return null;
        },
      },
    } as unknown as Request;

    rateLimit("forms-submit", req);
    const result = rateLimit("forms-submit", req);
    expect(result.remaining).toBe(8);
  });

  it("falls back to 127.0.0.1 when no IP headers present", () => {
    const req = {
      headers: { get: () => null },
    } as unknown as Request;

    rateLimit("forms-submit", req);
    const result = rateLimit("forms-submit", req);
    expect(result.remaining).toBe(8);
  });
});

describe("rateLimit — window reset", () => {
  it("allows requests again after window expires", () => {
    vi.useFakeTimers();

    const req = mockRequest("1.2.3.4");

    // Exhaust the limit
    for (let i = 0; i < 10; i++) {
      rateLimit("forms-submit", req);
    }
    expect(rateLimit("forms-submit", req).allowed).toBe(false);

    // Advance time past the window
    vi.advanceTimersByTime(60_001);

    // Should be allowed again
    const result = rateLimit("forms-submit", req);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(9);

    vi.useRealTimers();
  });

  it("prunes old timestamps outside the window", () => {
    vi.useFakeTimers();

    const req = mockRequest("1.2.3.4");

    // Make 5 requests at time 0
    for (let i = 0; i < 5; i++) {
      rateLimit("forms-submit", req);
    }

    // Advance past the window (60s + 1ms)
    vi.advanceTimersByTime(60_001);

    // All 5 old timestamps pruned (0 < 60_001 - 60_000 = 1).
    // This call counts as 1 new request, so remaining = 10 - 1 = 9.
    const result = rateLimit("forms-submit", req);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(9);

    vi.useRealTimers();
  });
});

describe("rateLimit — custom config", () => {
  it("respects per-call config overrides", () => {
    const req = mockRequest("1.2.3.4");

    // Custom: 2 requests per 10 seconds
    expect(
      rateLimit("custom-ns", req, { maxRequests: 2, windowMs: 10_000 })
        .allowed
    ).toBe(true);
    expect(
      rateLimit("custom-ns", req, { maxRequests: 2, windowMs: 10_000 })
        .allowed
    ).toBe(true);
    expect(
      rateLimit("custom-ns", req, { maxRequests: 2, windowMs: 10_000 })
        .allowed
    ).toBe(false);
  });

  it("uses default config for unknown namespaces", () => {
    const req = mockRequest("1.2.3.4");
    // Default for unknown: 30 req per 60s
    for (let i = 0; i < 30; i++) {
      rateLimit("unknown-ns", req);
    }
    expect(rateLimit("unknown-ns", req).allowed).toBe(false);
  });
});

describe("resetRateLimits", () => {
  it("clears all stores", () => {
    const req = mockRequest("1.2.3.4");

    // Exhaust forms-submit
    for (let i = 0; i < 10; i++) {
      rateLimit("forms-submit", req);
    }
    expect(rateLimit("forms-submit", req).allowed).toBe(false);

    // Reset
    resetRateLimits();

    // Should be allowed again
    const result = rateLimit("forms-submit", req);
    expect(result.allowed).toBe(true);
  });
});

describe("retryAfterHeader", () => {
  it("converts ms to seconds (rounded up)", () => {
    expect(retryAfterHeader(60_000)).toBe("60");
    expect(retryAfterHeader(1_500)).toBe("2");
    expect(retryAfterHeader(999)).toBe("1");
    expect(retryAfterHeader(0)).toBe("0");
  });
});
