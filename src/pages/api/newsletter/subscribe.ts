import type { APIRoute } from "astro";
import { subscribe, isNewsletterConfigured } from "@kapi/newsletter";
import { verifyCsrfToken, generateCsrfToken } from "@kapi/forms/csrf";
import { rateLimit, retryAfterHeader } from "@kapi/forms/rateLimiter";

/**
 * POST /api/newsletter/subscribe
 *
 * Subscribe an email to the configured newsletter provider.
 * Protected by CSRF token + optional Turnstile + rate limiting.
 *
 * Request body:
 *   { email: string, name?: string, tags?: string[], doubleOptin?: boolean, csrfToken?: string, turnstileToken?: string }
 *
 * Response:
 *   { success: boolean, message: string, provider?: string }
 */
export const POST: APIRoute = async ({ request }) => {
  // ── Rate limiting ──
  const limitResult = rateLimit("newsletter-subscribe", request);
  if (!limitResult.allowed) {
    return new Response(
      JSON.stringify({ success: false, message: "Too many requests. Please try again later." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": retryAfterHeader(limitResult.resetMs),
        },
      }
    );
  }

  if (!isNewsletterConfigured()) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Newsletter provider is not configured.",
      }),
      {
        status: 501,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const body = await request.json();
    const email = body.email?.trim();

    if (!email) {
      return new Response(
        JSON.stringify({ success: false, message: "Email is required." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid email address." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // ── CSRF Protection ──
    const csrfToken = body.csrfToken as string | undefined;
    const cookieHeader = request.headers.get("cookie");

    if (!verifyCsrfToken(csrfToken, cookieHeader)) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid or expired form token. Please refresh the page and try again." }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    const result = await subscribe({
      email,
      name: body.name?.trim(),
      tags: body.tags,
      doubleOptin: body.doubleOptin,
    });

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 400,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Invalid request body.",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

/**
 * GET /api/newsletter/csrf-token
 *
 * Returns a CSRF token for use with the newsletter subscribe endpoint.
 * The client should include this token and the corresponding cookie
 * when calling POST /api/newsletter/subscribe.
 */
export const GET: APIRoute = async () => {
  const { token, cookie } = generateCsrfToken();
  return new Response(JSON.stringify({ csrfToken: token }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": cookie,
    },
  });
};
