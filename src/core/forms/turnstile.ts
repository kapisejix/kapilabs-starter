/**
 * Cloudflare Turnstile — widget rendering helpers and server-side verification.
 *
 * Turnstile is a free CAPTCHA alternative that does not require user interaction.
 * https://developers.cloudflare.com/turnstile/
 *
 * Usage:
 *   - Set PUBLIC_TURNSTILE_SITE_KEY to render the widget
 *   - Set TURNSTILE_SECRET_KEY to verify on the server
 *   - If either is unset, Turnstile is silently skipped
 */

/**
 * Get the Turnstile site key from environment.
 */
export function getTurnstileSiteKey(): string | undefined {
  return (
    (typeof process !== "undefined"
      ? process.env.PUBLIC_TURNSTILE_SITE_KEY
      : undefined) ||
    (typeof import.meta !== "undefined"
      ? (import.meta as Record<string, any>).env?.PUBLIC_TURNSTILE_SITE_KEY
      : undefined)
  );
}

/**
 * Get the Turnstile secret key from environment.
 */
function getTurnstileSecretKey(): string | undefined {
  return (
    (typeof process !== "undefined"
      ? process.env.TURNSTILE_SECRET_KEY
      : undefined) ||
    (typeof import.meta !== "undefined"
      ? (import.meta as Record<string, any>).env?.TURNSTILE_SECRET_KEY
      : undefined)
  );
}

/**
 * Whether Turnstile is configured (both keys are set).
 */
export function isTurnstileEnabled(): boolean {
  return !!(getTurnstileSiteKey() && getTurnstileSecretKey());
}

/**
 * Generate the HTML for the Turnstile widget wrapper.
 * The widget is rendered by the Turnstile JS SDK.
 */
export function turnstileWidgetHtml(): string {
  const siteKey = getTurnstileSiteKey();
  if (!siteKey) return "";

  return `<div class="kapi-turnstile" data-turnstile-sitekey="${siteKey}"></div>
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>`;
}

/**
 * Verify a Turnstile token on the server side.
 * Calls the Cloudflare verification API.
 */
export async function verifyTurnstileToken(
  token: string | undefined | null
): Promise<{ success: boolean; error?: string }> {
  const secretKey = getTurnstileSecretKey();
  if (!secretKey) {
    // Turnstile not configured
    const isProd = typeof process !== "undefined" && process.env.NODE_ENV === "production";
    if (isProd) {
      return { success: false, error: "Turnstile not configured" };
    }
    return { success: true }; // dev only
  }

  if (!token) {
    return { success: false, error: "Missing Turnstile token" };
  }

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: secretKey,
          response: token,
        }),
      }
    );

    const result = (await response.json()) as {
      success: boolean;
      "error-codes"?: string[];
    };

    if (!result.success) {
      return {
        success: false,
        error: result["error-codes"]?.join(", ") || "Turnstile verification failed",
      };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Turnstile verification request failed",
    };
  }
}
