export const prerender = false;

import type { APIRoute } from "astro";
import { isAdminAuthorized } from "@kapi/forms/admin-auth";
import { validateThemeExport, previewImport, summarizeImport } from "@kapi/theme/export-import/import";

export const POST: APIRoute = async ({ request }) => {
  const headerKey = request.headers.get("x-admin-key");
  const cookieHeader = request.headers.get("cookie");

  if (!isAdminAuthorized(headerKey, cookieHeader)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!body || typeof body !== "object") {
    return new Response(JSON.stringify({ error: "Body must be a JSON object" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { theme: importData, mode = "merge" } = body as Record<string, any>;

  const validation = validateThemeExport(importData);
  if (!validation.valid) {
    return new Response(
      JSON.stringify({ success: false, errors: validation.errors }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const preview = previewImport(importData, mode);
    const summary = summarizeImport(importData);

    return new Response(
      JSON.stringify({
        success: preview.success,
        mode,
        summary,
        applied: preview.applied,
        skipped: preview.skipped,
        errors: preview.errors,
        warnings: preview.warnings,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, private",
        },
      }
    );
  } catch {
    return new Response(
      JSON.stringify({ error: "Failed to validate import" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
