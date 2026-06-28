import type { APIRoute } from "astro";
import { getSiteSettings } from "@kapi/cms";

export const prerender = false;

export const GET: APIRoute = async ({ site }) => {
  const siteUrl = site?.toString() || "https://localhost:4321";

  let sitemapUrl = `${siteUrl.replace(/\/$/, "")}/sitemap.xml`;

  try {
    await getSiteSettings();
    const host = siteUrl.replace(/\/$/, "");
    sitemapUrl = `${host}/sitemap.xml`;
  } catch {
    // Fallback: no CMS connection yet — sitemapUrl uses siteUrl
  }

  const body = [
    "User-agent: *",
    "Disallow: /admin/",
    "Allow: /",
    "",
    `Sitemap: ${sitemapUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=3600",
    },
  });
};
