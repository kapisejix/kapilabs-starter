import type { APIRoute } from "astro";
import { formStorage } from "@kapi/forms/storage";
import { sendFormNotification } from "@kapi/mailer";
import { verifyCsrfToken } from "@kapi/forms/csrf";
import { formSubmissionSchema, validateFieldValues, sanitizeValues } from "@kapi/forms/validation";
import { verifyTurnstileToken } from "@kapi/forms/turnstile";
import { rateLimit, retryAfterHeader } from "@kapi/forms/rateLimiter";

async function sendFormWebhook(url: string, submission: {
  formId: string;
  formTitle: string;
  emailTo?: string;
  pageUrl?: string;
  values: Record<string, unknown>;
  createdAt: string;
}) {
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "form_submission",
        formId: submission.formId,
        formTitle: submission.formTitle,
        emailTo: submission.emailTo,
        pageUrl: submission.pageUrl,
        values: submission.values,
        submittedAt: submission.createdAt,
      }),
    });
  } catch (err) {
    console.warn("Webhook POST failed:", err instanceof Error ? err.message : err);
  }
}

export const POST: APIRoute = async ({ request, locals }) => {
  // ── STEP 0: Rate limiting ──
  const limitResult = rateLimit("forms-submit", request);
  if (!limitResult.allowed) {
    return new Response(
      JSON.stringify({ message: "Too many requests. Please wait before submitting again." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": retryAfterHeader(limitResult.resetMs),
        },
      }
    );
  }

  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ message: "Invalid JSON." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // ── STEP 1: CSRF Protection ──
  const csrfToken = body.csrfToken as string | undefined;
  const cookieHeader = request.headers.get("cookie");

  if (!verifyCsrfToken(csrfToken, cookieHeader)) {
    return new Response(
      JSON.stringify({ message: "Invalid or expired form token. Please refresh the page and try again." }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  // ── STEP 2: Validate payload shape with Zod ──
  const parsed = formSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    return new Response(
      JSON.stringify({
        message: "Invalid submission format.",
        errors: fieldErrors,
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { formId, formTitle, emailTo, values, pageUrl, turnstileToken } = parsed.data;

  if (!formId || !values || typeof values !== "object") {
    return new Response(
      JSON.stringify({ message: "Missing required fields: formId, values." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // ── STEP 3: Turnstile verification ──
  const turnstileResult = await verifyTurnstileToken(turnstileToken);
  if (!turnstileResult.success) {
    return new Response(
      JSON.stringify({
        message: "Security verification failed. Please try again.",
        error: turnstileResult.error,
      }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  // ── STEP 4: Validate and sanitize field values ──
  // Try to get form definition for field-level validation
  let formFields: Array<{
    name: string;
    type: string;
    required?: boolean;
    options?: string[];
  }> | undefined;

  try {
    const { getForms } = await import("@kapi/cms");
    const forms = await getForms();
    const matchedForm = forms.find((f: any) => f.id === formId);
    if (matchedForm?.fields) {
      formFields = matchedForm.fields as any;
    }
  } catch {
    // If CMS is unavailable, skip field-level validation
  }

  const fieldValidation = validateFieldValues(
    values as Record<string, unknown>,
    formFields
  );

  if (Object.keys(fieldValidation.errors).length > 0) {
    return new Response(
      JSON.stringify({
        message: "Some fields have invalid values.",
        fieldErrors: fieldValidation.errors,
      }),
      { status: 422, headers: { "Content-Type": "application/json" } }
    );
  }

  // Sanitize all values to strip XSS vectors
  const safeValues = sanitizeValues(fieldValidation.data);

  // ── STEP 5: Initialize D1 binding if using cloudflare-d1 backend ──
  const storageBackend =
    import.meta.env.FORM_STORAGE_BACKEND ||
    process.env.FORM_STORAGE_BACKEND ||
    "json";

  if (storageBackend === "cloudflare-d1") {
    const { setD1Database } = await import("@kapi/forms/storage/cloudflare-d1");
    const DB = locals.runtime?.env?.DB;
    if (DB) {
      setD1Database(DB);
    }
  }

  try {
    const submissionData = {
      id: crypto.randomUUID(),
      formId: String(formId),
      formTitle: String(formTitle || formId),
      emailTo: emailTo ? String(emailTo) : undefined,
      pageUrl: pageUrl ? String(pageUrl) : undefined,
      values: safeValues as unknown as Record<string, unknown>,
      createdAt: new Date().toISOString(),
    };

    const submission = await formStorage.saveSubmission(submissionData);

    // Fire email notification (fire-and-forget)
    const FORM_EMAIL_TO = process.env.FORM_EMAIL_TO || import.meta.env.FORM_EMAIL_TO;
    const FORM_EMAIL_FROM = process.env.FORM_EMAIL_FROM || import.meta.env.FORM_EMAIL_FROM;

    if (FORM_EMAIL_TO) {
      sendFormNotification({
        to: FORM_EMAIL_TO,
        from: FORM_EMAIL_FROM || "noreply@localhost",
        formTitle: String(formTitle || formId),
        values: safeValues as unknown as Record<string, unknown>,
        pageUrl: pageUrl ? String(pageUrl) : undefined,
      }).catch(() => {});
    }

    // Fire webhook (env var only — no client-supplied URL)
    const FORM_WEBHOOK_URL = process.env.FORM_WEBHOOK_URL || import.meta.env.FORM_WEBHOOK_URL;
    if (FORM_WEBHOOK_URL) {
      sendFormWebhook(FORM_WEBHOOK_URL, {
        formId: String(formId),
        formTitle: String(formTitle || formId),
        emailTo: emailTo ? String(emailTo) : undefined,
        pageUrl: pageUrl ? String(pageUrl) : undefined,
        values: safeValues as unknown as Record<string, unknown>,
        createdAt: submissionData.createdAt,
      }).catch(() => {});
    }

    return new Response(
      JSON.stringify({ message: "Thank you. Your message has been sent.", id: submission.id }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Submission failed.";
    return new Response(JSON.stringify({ message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
