/**
 * Admin Authentication — short-lived signed tokens.
 *
 * Replaces raw admin keys in URLs with HMAC-signed session tokens.
 * Tokens are valid for 15 minutes and bound to the server's FORM_ADMIN_KEY.
 *
 * Flow:
 *   1. Admin submits FORM_ADMIN_KEY via x-admin-key header or login form
 *   2. Server validates and issues a short-lived signed token as HttpOnly cookie
 *   3. All subsequent requests verify the cookie token instead of the raw key
 */

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { parseCookies } from "../utils/cookies";

function getAdminKey(): string | undefined {
  return process.env.FORM_ADMIN_KEY || (typeof import.meta !== "undefined"
    ? (import.meta as Record<string, any>).env?.FORM_ADMIN_KEY
    : undefined);
}

/**
 * Generate a short-lived admin session token.
 * Returns the token value and an HttpOnly cookie string.
 */
export function generateAdminToken(): { token: string; cookie: string } {
  const key = getAdminKey();
  if (!key) return { token: "", cookie: "" };

  const secret = randomBytes(16).toString("hex");
  const timestamp = Math.floor(Date.now() / 1000).toString(36);
  const signature = createHmac("sha256", key)
    .update(`${secret}:${timestamp}`)
    .digest("hex");
  const token = `${secret}.${timestamp}.${signature}`;

  return {
    token,
    cookie: `kapi_admin=${token}; Path=/; HttpOnly; SameSite=Strict; Secure; Max-Age=900`,
  };
}

/**
 * Verify an admin session token.
 * Checks HMAC signature and 15-minute expiry.
 */
export function verifyAdminToken(
  token: string | undefined | null
): boolean {
  if (!token) return false;
  const key = getAdminKey();
  if (!key) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [secret, timestamp, signature] = parts;

  // Verify HMAC signature (constant-time comparison)
  const expectedSig = createHmac("sha256", key)
    .update(`${secret}:${timestamp}`)
    .digest("hex");

  if (signature.length !== expectedSig.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) return false;

  // Check expiry (15 minutes from issuance)
  const age = Math.floor(Date.now() / 1000) - parseInt(timestamp, 36);
  if (age > 900) return false;

  return true;
}

/**
 * Extract the admin token from a request's Cookie header.
 */
export function getAdminTokenFromCookies(
  cookieHeader: string | undefined | null
): string | null {
  if (!cookieHeader) return null;
  const cookies = parseCookies(cookieHeader);
  return cookies["kapi_admin"] || null;
}

/**
 * Check if a request is authorized as admin.
 * Checks x-admin-key header first, then falls back to session cookie.
 */
export function isAdminAuthorized(
  headerKey: string | null,
  cookieHeader: string | undefined | null
): boolean {
  const adminKey = getAdminKey();
  if (!adminKey) return false;

  // Check x-admin-key header (constant-time comparison)
  if (headerKey && adminKey && headerKey.length === adminKey.length && timingSafeEqual(Buffer.from(headerKey), Buffer.from(adminKey))) return true;

  // Fall back to session cookie
  const token = getAdminTokenFromCookies(cookieHeader);
  return verifyAdminToken(token);
}
