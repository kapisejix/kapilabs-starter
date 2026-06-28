/**
 * In-memory sliding-window rate limiter for API endpoints.
 *
 * Tracks request counts per IP per endpoint using a sliding time window.
 * In production with multiple workers, replace with Cloudflare KV + Workers
 * or a Redis-backed implementation.
 *
 * Usage:
 *   import { rateLimit } from "@kapi/forms/rateLimiter";
 *
 *   const result = rateLimit("forms-submit", request);
 *   if (!result.allowed) {
 *     return new Response("Too many requests", { status: 429 });
 *   }
 */

interface RateLimitEntry {
  /** Timestamps of requests within the current window (ms) */
  timestamps: number[];
}

interface RateLimitConfig {
  /** Max requests allowed within the window */
  maxRequests: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
}

const DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
  "forms-submit": { maxRequests: 10, windowMs: 60_000 },       // 10 req/min
  "forms-export": { maxRequests: 30, windowMs: 60_000 },       // 30 req/min
  "newsletter-subscribe": { maxRequests: 5, windowMs: 60_000 }, // 5 req/min
};

const stores = new Map<string, Map<string, RateLimitEntry>>();

// Periodic cleanup to prevent unbounded Map growth — runs every 5 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
const MAX_WINDOW_MS = 10 * 60 * 1000; // longest allowed window (10 min)

if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const cutoff = Date.now() - MAX_WINDOW_MS;
    for (const [, ipMap] of stores) {
      for (const [ip, entry] of ipMap) {
        entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
        if (entry.timestamps.length === 0) {
          ipMap.delete(ip);
        }
      }
    }
  }, CLEANUP_INTERVAL_MS).unref?.();
}

function getClientIp(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1"
  );
}

/**
 * Check and record a request against the rate limit for the given namespace.
 *
 * @param namespace  Rate limit namespace (e.g., "forms-submit")
 * @param request    The incoming request (used to extract client IP)
 * @param config     Optional config override
 * @returns          Result with allowed flag, remaining count, and reset time
 */
export function rateLimit(
  namespace: string,
  request: Request,
  config?: Partial<RateLimitConfig>
): RateLimitResult {
  const cfg = {
    ...(DEFAULT_CONFIGS[namespace] || { maxRequests: 30, windowMs: 60_000 }),
    ...config,
  };

  const ip = getClientIp(request);
  const now = Date.now();
  const windowStart = now - cfg.windowMs;

  // Get or create the store for this namespace
  let store = stores.get(namespace);
  if (!store) {
    store = new Map<string, RateLimitEntry>();
    stores.set(namespace, store);
  }

  // Get or create the entry for this IP
  let entry = store.get(ip);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(ip, entry);
  }

  // Prune timestamps outside the current window
  entry.timestamps = entry.timestamps.filter((t) => t > windowStart);

  // Check if limit is exceeded
  if (entry.timestamps.length >= cfg.maxRequests) {
    const oldest = entry.timestamps[0];
    return {
      allowed: false,
      remaining: 0,
      resetMs: oldest + cfg.windowMs - now,
    };
  }

  // Record this request
  entry.timestamps.push(now);

  return {
    allowed: true,
    remaining: cfg.maxRequests - entry.timestamps.length,
    resetMs: cfg.windowMs,
  };
}

/**
 * Create a Retry-After header value from the reset time in ms.
 */
export function retryAfterHeader(resetMs: number): string {
  return Math.ceil(resetMs / 1000).toString();
}

/**
 * Reset all rate limit stores (useful for testing).
 */
export function resetRateLimits(): void {
  stores.clear();
}
