/**
 * CSRF Protection — cookie-based token generation and verification.
 *
 * Uses a HMAC-signed cookie to store the CSRF token.
 * The token is also embedded as a hidden form field.
 * On submission, the cookie and field values are compared.
 *
 * In production (Cloudflare), the secret should come from env var.
 * In development, a random secret is generated per server start.
 */

import { createHmac, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { parseCookies } from "../utils/cookies";

// Fallback secret for dev — in production, always set CSRF_SECRET
let devSecret: string | null = null;

function getSecret(): string {
  const envSecret = typeof process !== "undefined"
    ? process.env.CSRF_SECRET
    : undefined;
  const metaSecret = typeof import.meta !== "undefined"
    ? (import.meta as Record<string, any>).env?.CSRF_SECRET
    : undefined;

  if (envSecret || metaSecret) return (envSecret || metaSecret) as string;

  if (!devSecret) {
    // Generate a cryptographically random secret for the dev session
    devSecret = randomBytes(32).toString("hex");
  }

  return devSecret;
}

/**
 * Generate a CSRF token and return it along with a cookie header value.
 */
export function generateCsrfToken(): { token: string; cookie: string } {
  const token = randomUUID();
  const secret = getSecret();
  const timestamp = Date.now().toString(36);
  const signature = sign(token, timestamp, secret);
  const cookieValue = `${token}.${timestamp}.${signature}`;

  return {
    token,
    cookie: `kapi_csrf=${cookieValue}; Path=/; HttpOnly; SameSite=Strict; Secure; Max-Age=86400`,
  };
}

/**
 * Verify a CSRF token from a form submission against the cookie.
 */
export function verifyCsrfToken(
  formToken: string | undefined | null,
  cookieHeader: string | undefined | null
): boolean {
  if (!formToken || !cookieHeader) return false;

  // Extract the cookie value
  const cookies = parseCookies(cookieHeader);
  const cookieValue = cookies["kapi_csrf"];
  if (!cookieValue) return false;

  // Parse cookie value: token.timestamp.signature
  const parts = cookieValue.split(".");
  if (parts.length !== 3) return false;
  const [cookieToken, timestamp, signature] = parts;

  // Verify form token matches cookie token (constant-time comparison)
  if (formToken.length !== cookieToken.length || !timingSafeEqual(Buffer.from(formToken), Buffer.from(cookieToken))) return false;

  // Verify signature hasn't been tampered with (constant-time comparison)
  const secret = getSecret();
  const expectedSig = sign(cookieToken, timestamp, secret);
  if (signature.length !== expectedSig.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) return false;

  // Check token age (max 24 hours)
  const age = Date.now() - parseInt(timestamp, 36);
  if (age > 86400000) return false; // 24 hours

  return true;
}

/**
 * HMAC-SHA256 signature using Node.js crypto.
 * Cryptographically secure replacement for the previous homemade 32-bit hash.
 */
function sign(token: string, timestamp: string, secret: string): string {
  return createHmac("sha256", secret)
    .update(`${token}:${timestamp}`)
    .digest("hex");
}
