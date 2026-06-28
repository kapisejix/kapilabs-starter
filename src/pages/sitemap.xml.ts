import type { APIRoute } from "astro";
import { getPosts, getTeamMembers } from "@kapi/cms";

export const prerender = false;

type SitemapEntry = {
  url: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
};

export const GET: APIRoute = async ({ site }) => {
  const siteUrl = site?.toString() || "https://localhost:4321";
  const host = siteUrl.replace(/\/$/, "");

  const entries: SitemapEntry[] = [
    { url: "/", changefreq: "daily", priority: "1.0" },
    { url: "/blog", changefreq: "daily", priority: "0.8" },
    { url: "/search", changefreq: "weekly", priority: "0.3" },
  ];

  try {
    // Fetch all posts
    const posts = await getPosts();
    for (const post of posts) {
      entries.push({
        url: `/blog/${post.slug}`,
        lastmod: post.publishedAt,
        changefreq: "monthly",
        priority: "0.6",
      });
    }
  } catch {
    // Posts not available yet
  }

  try {
    // Fetch team members
    const team = await getTeamMembers();
    if (team.length > 0) {
      entries.push({ url: "/team", changefreq: "monthly", priority: "0.5" });
      for (const member of team) {
        entries.push({
          url: `/team/${member.slug}`,
          changefreq: "monthly",
          priority: "0.4",
        });
      }
    }
  } catch {
    // Team not available yet
  }

  // Build XML
  const urls = entries
    .map(
      (entry) => `  <url>
    <loc>${host}${entry.url}</loc>
    ${entry.lastmod ? `    <lastmod>${new Date(entry.lastmod).toISOString()}</lastmod>\n` : ""}    <changefreq>${entry.changefreq || "weekly"}</changefreq>
    <priority>${entry.priority || "0.5"}</priority>
  </url>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=1800",
    },
  });
};
