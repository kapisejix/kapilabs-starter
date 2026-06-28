export const prerender = false;

import type { APIRoute } from "astro";
import { isAdminAuthorized } from "@kapi/forms/admin-auth";
import { exportThemeJson } from "@kapi/theme/export-import/export";

export const GET: APIRoute = async ({ request }) => {
  const headerKey = request.headers.get("x-admin-key");
  const cookieHeader = request.headers.get("cookie");

  if (!isAdminAuthorized(headerKey, cookieHeader)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const json = await exportThemeJson();
    const filename = `theme-export-${new Date().toISOString().slice(0, 10)}.json`;

    return new Response(json, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, private",
      },
    });
  } catch {
    return new Response(
      JSON.stringify({ error: "Failed to export theme" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
