import type { APIRoute } from "astro";
import { formStorage } from "@kapi/forms/storage";
import { isAdminAuthorized } from "@kapi/forms/admin-auth";
import { rateLimit, retryAfterHeader } from "@kapi/forms/rateLimiter";

export const GET: APIRoute = async ({ request }) => {
  // ── Rate limiting ──
  const limitResult = rateLimit("forms-export", request);
  if (!limitResult.allowed) {
    return new Response(
      JSON.stringify({ message: "Too many requests. Try again later." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": retryAfterHeader(limitResult.resetMs),
        },
      }
    );
  }

  // ── Auth: header-only (no query params) ──
  const authHeader = request.headers.get("x-admin-key");
  const cookieHeader = request.headers.get("cookie");

  if (!isAdminAuthorized(authHeader, cookieHeader)) {
    return new Response(JSON.stringify({ message: "Unauthorized." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const url = new URL(request.url);
  const form = url.searchParams.get("form") || undefined;
  const search = url.searchParams.get("search") || undefined;

  const submissions = await formStorage.listSubmissions({ form, search });

  if (submissions.length === 0) {
    return new Response("formId,formTitle,pageUrl,submittedAt\r\n", {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=form-submissions.csv",
      },
    });
  }

  const valueKeys = Array.from(
    new Set(submissions.flatMap((s) => Object.keys(s.values || {})))
  );

  const headers = ["formId", "formTitle", "pageUrl", "submittedAt", ...valueKeys];

  function escapeCsv(val: unknown): string {
    const str = val == null ? "" : String(val);
    // Must quote if value contains comma, double-quote, newline, carriage return, or tab
    if (/[,"\n\r\t]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  const rows = [
    headers.join(","),
    ...submissions.map((s) =>
      [
        escapeCsv(s.formId),
        escapeCsv(s.formTitle),
        escapeCsv(s.pageUrl),
        escapeCsv(s.createdAt),
        ...valueKeys.map((k) => escapeCsv((s.values as Record<string, unknown>)[k])),
      ].join(",")
    ),
  ];

  return new Response(rows.join("\r\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=form-submissions.csv",
    },
  });
};
