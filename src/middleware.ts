/**
 * Astro middleware — Security Phase 2 + Multi-site Foundation.
 *
 * Security:
 *   Applies CSP, HSTS, X-Content-Type-Options, Referrer-Policy, and CORS headers.
 *
 * Multi-site:
 *   Resolves site context from the incoming hostname using kapilabs.config.ts.
 *   Attaches to Astro.locals.site for use by page components.
 *
 * Configuration via environment variables:
 *   CSP_MODE              — "enforce" | "report-only" | "off" (default: "report-only")
 *   CSP_REPORT_URI        — CSP report-uri endpoint (default: "/csp-report")
 *   HSTS_ENABLED          — "true" | "false" (default: "true")
 *   HSTS_MAX_AGE          — Seconds (default: 31536000 = 1 year)
 *   HSTS_PRELOAD          — "true" | "false" (default: "false")
 *   PUBLIC_KAPI_CORS      — Comma-separated allowed origins for CORS (default: none)
 */

import type { APIContext, MiddlewareNext } from "astro";
import { resolveSiteContext, isMultiSiteEnabled } from "./core/multisite/registry";

// ─── Default CSP Configuration ─────────────────────────────────────────────────

function buildCspHeader(
  mode: "enforce" | "report-only",
  directives: Record<string, string | string[] | boolean>
): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(directives)) {
    if (value === false) continue;
    if (value === true) { parts.push(key); continue; }
    if (Array.isArray(value)) {
      parts.push(`${key} ${value.join(" ")}`);
    } else {
      parts.push(`${key} ${value}`);
    }
  }
  const headerName = mode === "report-only"
    ? "Content-Security-Policy-Report-Only"
    : "Content-Security-Policy";
  return `${headerName}: ${parts.join("; ")}`;
}

function getDefaultCspDirectives(): Record<string, string | string[] | boolean> {
  const directives: Record<string, string | string[] | boolean> = {
    "default-src": ["'self'"],
    "script-src": ["'self'", "'unsafe-inline'", "https://challenges.cloudflare.com"],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:", "https:"],
    "connect-src": ["'self'", "https://challenges.cloudflare.com"],
    "font-src": ["'self'", "data:"],
    "frame-src": ["'self'", "https://challenges.cloudflare.com"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "worker-src": ["'self'", "blob:"],
    "manifest-src": ["'self'"],
  };

  // CSP report-uri — optional, configured via CSP_REPORT_URI env var
  const reportUri = typeof process !== "undefined"
    ? process.env.CSP_REPORT_URI
    : undefined;
  if (reportUri) {
    directives["report-uri"] = reportUri;
  }

  return directives;
}

function getCspMode(): "enforce" | "report-only" | "off" {
  const mode = ((typeof process !== "undefined" ? process.env.CSP_MODE : undefined) || "report-only").toLowerCase() as any;
  if (!["enforce", "report-only", "off"].includes(mode)) return "report-only";
  return mode;
}

function getHstsHeader(): string | null {
  const enabled = (typeof process !== "undefined" ? process.env.HSTS_ENABLED : undefined) !== "false";
  if (!enabled) return null;
  const maxAge = parseInt((typeof process !== "undefined" ? process.env.HSTS_MAX_AGE : undefined) || "31536000", 10);
  const includeSubDomains = (typeof process !== "undefined" ? process.env.HSTS_INCLUDE_SUBDOMAINS : undefined) !== "false";
  const preload = (typeof process !== "undefined" ? process.env.HSTS_PRELOAD : undefined) === "true";
  let header = `max-age=${maxAge}`;
  if (includeSubDomains) header += "; includeSubDomains";
  if (preload) header += "; preload";
  return header;
}

// ─── Middleware ─────────────────────────────────────────────────────────────────

let cspHeader: string | null = null;
let hstsHeader: string | null = null;

function init() {
  if (cspHeader) return;
  const cspMode = getCspMode();
  if (cspMode !== "off") {
    const directives = getDefaultCspDirectives();
    // report-uri is now set in getDefaultCspDirectives
    cspHeader = buildCspHeader(cspMode, directives);
  }
  hstsHeader = getHstsHeader();
}

export async function onRequest(
  context: APIContext,
  next: MiddlewareNext
): Promise<Response> {
  init();

  // ── Multi-site: resolve site context from hostname ──────────────────────────
  const multiSiteEnabled = await isMultiSiteEnabled();

  if (multiSiteEnabled) {
    const hostname = context.request.headers.get("host") || "localhost";
    const siteContext = await resolveSiteContext(hostname);

    if (!siteContext) {
      return new Response(
        "Site not found. Check the multi-site configuration.",
        { status: 404, headers: { "Content-Type": "text/plain" } }
      );
    }

    context.locals.site = siteContext;
  }

  const response = await next();

  // ── CORS headers (for API routes) ─────────────────────────────────────────
  const requestOrigin = context.request.headers.get("origin");
  const corsOrigins = typeof process !== "undefined"
    ? process.env.PUBLIC_KAPI_CORS
    : undefined;

  if (requestOrigin && corsOrigins && !response.headers.has("Access-Control-Allow-Origin")) {
    const allowedOrigins = corsOrigins.split(",").map((o) => o.trim());
    if (allowedOrigins.includes("*") || allowedOrigins.includes(requestOrigin)) {
      const allowOrigin = allowedOrigins.includes("*") ? "*" : requestOrigin;
      response.headers.set("Access-Control-Allow-Origin", allowOrigin);
      response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      response.headers.set("Access-Control-Allow-Headers", "Content-Type, x-admin-key");
      response.headers.set("Access-Control-Max-Age", "86400");
    }
  }

  // ── Security headers (applied to all responses) ───────────────────────────
  // HSTS, X-Content-Type-Options must be on all responses per security best practices
  if (hstsHeader && !response.headers.has("Strict-Transport-Security")) {
    response.headers.set("Strict-Transport-Security", hstsHeader);
  }
  if (!response.headers.has("X-Content-Type-Options")) {
    response.headers.set("X-Content-Type-Options", "nosniff");
  }

  // CSP, Referrer-Policy, X-Frame-Options, Permissions-Policy on HTML/JSON
  const contentType = response.headers.get("Content-Type") || "";
  if (contentType.includes("text/html") || contentType.includes("application/json")) {
    if (cspHeader && !response.headers.has("Content-Security-Policy") && !response.headers.has("Content-Security-Policy-Report-Only")) {
      const colonIdx = cspHeader.indexOf(":");
      response.headers.set(cspHeader.substring(0, colonIdx), cspHeader.substring(colonIdx + 1).trim());
    }
    if (!response.headers.has("Referrer-Policy")) {
      response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    }
    if (!response.headers.has("X-Frame-Options")) {
      response.headers.set("X-Frame-Options", "DENY");
    }
    if (!response.headers.has("Permissions-Policy")) {
      response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
    }
  }

  return response;
}
