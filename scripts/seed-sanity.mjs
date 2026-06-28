#!/usr/bin/env node

/**
 * seed-sanity.mjs
 *
 * Seeds starter content from the `starter-content/` directory into a Sanity project.
 *
 * Usage:
 *   pnpm seed                                    # seed to Sanity (requires .env)
 *   node scripts/seed-sanity.mjs --dry-run       # preview documents without writing
 *
 * What it seeds:
 *   - Site Settings & Theme Settings (singletons)
 *   - Testimonial Settings (singleton)
 *   - Pages   (starter-content/pages/*.md)
 *   - Posts   (starter-content/posts/*.md)
 *   - Team    (starter-content/team/*.md)
 *   - Forms   (starter-content/forms/*.json)
 *   - Menus   (starter-content/starter.config.json menus section)
 *   - Testimonials (starter-content/testimonials.json)
 */

import { createClient } from "@sanity/client";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "..");
const STARTER_CONTENT_DIR = resolve(PROJECT_ROOT, "starter-content");

const DRY_RUN = process.argv.includes("--dry-run");

// ── Helpers ──────────────────────────────────────────────

function parseEnv(filePath) {
  const content = readFileSync(filePath, "utf-8");
  const env = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    env[key] = val;
  }
  return env;
}

let _keyCounter = 0;
function key() {
  return `k${++_keyCounter}`;
}

function parseFrontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return { frontmatter: {}, body: text };

  const yamlLines = match[1];
  const body = text.slice(match[0].length);
  const fm = {};

  let currentKey = null;
  const lines = yamlLines.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) continue;

    if (trimmed.startsWith("- ") && currentKey) {
      if (!Array.isArray(fm[currentKey])) {
        fm[currentKey] = [];
      }
      fm[currentKey].push(trimmed.slice(2).trim());
      continue;
    }

    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;

    const k = line.slice(0, colonIdx).trim();
    let v = line.slice(colonIdx + 1).trim();
    currentKey = k;

    if (v.startsWith("[") && v.endsWith("]")) {
      fm[k] = v.slice(1, -1).split(",").map((s) => s.trim()).filter(Boolean);
      continue;
    }

    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }

    if (v === "true") v = true;
    else if (v === "false") v = false;
    else if (v !== "" && !isNaN(Number(v))) v = Number(v);

    fm[k] = v;
  }

  return { frontmatter: fm, body: body.trim() };
}

function normalizeDate(val) {
  if (!val) return new Date().toISOString();
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return `${val}T00:00:00.000Z`;
  return val;
}

function bodyToPortableText(body) {
  if (!body) return [];

  const blocks = [];
  const lines = body.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    let style = "normal";
    let text = trimmed;

    if (trimmed.startsWith("### ") && trimmed.length > 4) {
      style = "h3";
      text = trimmed.slice(4);
    } else if (trimmed.startsWith("## ") && trimmed.length > 3) {
      style = "h2";
      text = trimmed.slice(3);
    } else if (trimmed.startsWith("# ") && trimmed.length > 2) {
      style = "h1";
      text = trimmed.slice(2);
    } else if (trimmed.startsWith("> ")) {
      style = "blockquote";
      text = trimmed.slice(2);
    }

    blocks.push({
      _type: "block",
      _key: key(),
      style,
      markDefs: [],
      children: [{ _type: "span", _key: key(), text, marks: [] }],
    });
  }

  return blocks;
}

function slugValue(slug) {
  return { _type: "slug", current: slug.replace(/^\/+|\/+$/g, "") || "home" };
}

// ── Content loaders ──────────────────────────────────────

function loadConfig() {
  const configPath = join(STARTER_CONTENT_DIR, "starter.config.json");
  if (!existsSync(configPath)) {
    console.warn("  ⚠  starter.config.json not found — skipping site config & menus");
    return null;
  }
  return JSON.parse(readFileSync(configPath, "utf-8").replace(/^﻿/, ""));
}

function loadMarkdownFiles(subdir) {
  const dir = join(STARTER_CONTENT_DIR, subdir);
  if (!existsSync(dir)) return [];

  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const text = readFileSync(join(dir, f), "utf-8").replace(/^﻿/, "");
      const { frontmatter, body } = parseFrontmatter(text);
      return { file: f, ...frontmatter, _body: body };
    });
}

function loadJsonFiles(subdir) {
  const dir = join(STARTER_CONTENT_DIR, subdir);
  if (!existsSync(dir)) return [];

  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const data = JSON.parse(readFileSync(join(dir, f), "utf-8").replace(/^﻿/, ""));
      return { file: f, ...data };
    });
}

function loadSectionFiles() {
  const dir = join(STARTER_CONTENT_DIR, "sections");
  if (!existsSync(dir)) return {};

  const result = {};
  readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .forEach((f) => {
      const slug = f.replace(/\.json$/, "");
      const data = JSON.parse(readFileSync(join(dir, f), "utf-8").replace(/^﻿/, ""));
      result[slug] = Array.isArray(data) ? data : [];
    });
  return result;
}

function loadTestimonials() {
  const filePath = join(STARTER_CONTENT_DIR, "testimonials.json");
  if (!existsSync(filePath)) return [];
  const data = JSON.parse(readFileSync(filePath, "utf-8").replace(/^﻿/, ""));
  return Array.isArray(data) ? data : [];
}

// ── Section builder ──────────────────────────────────────

function buildSectionItem(section) {
  const s = { ...section, _key: key() };

  if (typeof s.text === "string") {
    s.text = bodyToPortableText(s.text);
  }

  if (Array.isArray(s.items)) {
    s.items = s.items.map((item) => {
      const it = { ...item, _key: key() };
      if (typeof it.text === "string") it.text = bodyToPortableText(it.text);
      if (typeof it.answer === "string") it.answer = bodyToPortableText(it.answer);
      if (typeof it.quote === "string") it.quote = bodyToPortableText(it.quote);
      return it;
    });
  }

  return s;
}

// ── Document builders ────────────────────────────────────

function buildSiteSettings(config) {
  if (!config?.site) return null;

  return {
    _id: "siteSettings",
    _type: "siteSettings",
    siteTitle: config.site.name || "KapiLabs Starter Site",
    tagline: config.site.description || "",
  };
}

function buildThemeSettings() {
  return {
    _id: "themeSettings",
    _type: "themeSettings",
    title: "Theme Settings",
    primaryColor: "#111827",
    secondaryColor: "#2563eb",
    backgroundColor: "#ffffff",
    textColor: "#111827",
    containerWidth: "1200px",
    buttonStyle: "rounded",
  };
}

function buildTestimonialSettings() {
  return {
    _id: "testimonialSettings",
    _type: "testimonialSettings",
    defaultLayout: "grid",
    defaultColumns: 3,
    showRating: true,
    showSource: false,
    showAvatar: true,
    showDate: false,
    showCity: true,
    minRating: 1,
    maxCharacters: 0,
    showReadMore: true,
    starColor: "#f59e0b",
    cardBorderRadius: "12px",
    shadowEnabled: true,
  };
}

function buildPages(pages, sectionsBySlug) {
  return pages.map((p) => {
    const rawSlug = p.slug || p.file.replace(/\.md$/, "");
    const slugStr = rawSlug.replace(/^\/+|\/+$/g, "") || "home";
    const rawSections = sectionsBySlug[slugStr] || [];
    const sections = rawSections.map(buildSectionItem);

    return {
      _id: `seed-page-${slugStr}`,
      _type: "page",
      title: p.title || "Untitled Page",
      slug: slugValue(rawSlug),
      template: p.template || "default",
      layout: p.layout || "content-sidebar",
      content: bodyToPortableText(p._body),
      ...(sections.length > 0 && { sections }),
    };
  });
}

function buildPosts(posts) {
  return posts.map((p) => ({
    _id: `seed-post-${p.slug || p.file.replace(/\.md$/, "")}`,
    _type: "post",
    title: p.title || "Untitled Post",
    slug: slugValue(p.slug || p.file.replace(/\.md$/, "")),
    excerpt: p.excerpt || "",
    publishedAt: normalizeDate(p.publishedAt),
    categories: Array.isArray(p.categories) ? p.categories : [],
    tags: Array.isArray(p.tags) ? p.tags : [],
    content: bodyToPortableText(p._body),
  }));
}

function buildTeamMembers(members) {
  return members.map((m) => ({
    _id: `seed-team-${m.slug || m.file.replace(/\.md$/, "")}`,
    _type: "teamMember",
    name: m.name || "Team Member",
    slug: slugValue(m.slug || m.file.replace(/\.md$/, "")),
    role: m.role || "",
    bio: m.bio || "",
    ...(m.email && { email: m.email }),
    ...(m.website && { website: m.website }),
    ...(m.linkedin && { linkedin: m.linkedin }),
    ...(m.twitter && { twitter: m.twitter }),
    ...(m.github && { github: m.github }),
  }));
}

function buildTestimonials(testimonials) {
  return testimonials.map((t) => {
    const id = t.id || t.clientName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return {
      _id: `seed-testimonial-${id}`,
      _type: "testimonial",
      clientName: t.clientName || "Anonymous",
      role: t.role || "",
      company: t.company || "",
      testimonialText: bodyToPortableText(t.testimonialText || ""),
      source: t.source || "custom",
      rating: typeof t.rating === "number" ? t.rating : 5,
      isPublished: t.isPublished !== false,
      isFeatured: t.isFeatured === true,
      ...(t.reviewDate && { reviewDate: t.reviewDate }),
    };
  });
}

function buildForms(forms) {
  return forms.map((f) => ({
    _id: `seed-form-${f.id || f.file.replace(/\.json$/, "")}`,
    _type: "form",
    title: f.name || "Untitled Form",
    formType: f.formType || f.id || "contact",
    successMessage: f.successMessage || "Thank you. Your message has been sent.",
    fields: (f.fields || []).map((field) => ({
      _key: key(),
      label: field.label || field.name || "",
      name: field.name || "",
      type: field.type || "text",
      required: field.required || false,
      placeholder: field.placeholder || "",
    })),
  }));
}

function buildMenus(config) {
  if (!config?.menus) return [];

  return Object.entries(config.menus).map(([name, items]) => ({
    _id: `seed-menu-${name}`,
    _type: "menu",
    name,
    location: name,
    items: (items || []).map((item) => ({
      _key: key(),
      itemType: "custom",
      label: item.label || item.title || "",
      url: item.href || item.url || "#",
    })),
  }));
}

// ── Main ─────────────────────────────────────────────────

async function seed() {
  // ── Load starter content (always, even for dry-run) ──
  console.log("─ Loading starter content...");
  const config = loadConfig();
  const pages = loadMarkdownFiles("pages");
  const posts = loadMarkdownFiles("posts");
  const members = loadMarkdownFiles("team");
  const forms = loadJsonFiles("forms");
  const testimonials = loadTestimonials();
  const sectionsBySlug = loadSectionFiles();

  const sectionPageSlugs = Object.keys(sectionsBySlug);

  console.log(`  Config:       ${config ? "found" : "not found"}`);
  console.log(`  Pages:        ${pages.length} found`);
  console.log(`  Sections:     ${sectionPageSlugs.length} page(s) — ${sectionPageSlugs.join(", ") || "none"}`);
  console.log(`  Posts:        ${posts.length} found`);
  console.log(`  Team:         ${members.length} found`);
  console.log(`  Forms:        ${forms.length} found`);
  console.log(`  Testimonials: ${testimonials.length} found`);

  // ── Build documents ──
  const documents = [];

  const siteSettings = buildSiteSettings(config);
  if (siteSettings) documents.push(siteSettings);

  documents.push(buildThemeSettings());
  documents.push(buildTestimonialSettings());
  documents.push(...buildPages(pages, sectionsBySlug));
  documents.push(...buildPosts(posts));
  documents.push(...buildTeamMembers(members));
  documents.push(...buildForms(forms));
  documents.push(...buildTestimonials(testimonials));
  documents.push(...buildMenus(config));

  if (documents.length === 0) {
    console.log("  No documents to seed. Add starter content files or check paths.");
    return;
  }

  // ── Dry run — exit before touching Sanity ──
  if (DRY_RUN) {
    console.log(`\n─ DRY RUN — ${documents.length} documents (not written to Sanity):`);
    for (const doc of documents) {
      const label = doc.title || doc.name || doc.clientName || doc.siteTitle || doc._id;
      console.log(`  [${doc._type}] ${doc._id}  (${label})`);
    }
    console.log("\n  ✅ Dry run complete. No changes made.");
    console.log("  Run without --dry-run to seed into Sanity.");
    return;
  }

  // ── Resolve Sanity credentials ──
  const envPath = resolve(PROJECT_ROOT, ".env");
  if (!existsSync(envPath)) {
    console.error("ERROR: .env file not found at", envPath);
    console.error("  Copy .env.example to .env and fill in your Sanity project ID and token.");
    process.exit(1);
  }

  const env = parseEnv(envPath);
  const projectId = env.PUBLIC_SANITY_PROJECT_ID;
  const dataset = env.PUBLIC_SANITY_DATASET || "production";
  const token = env.SANITY_TOKEN;

  if (!projectId) {
    console.error("ERROR: PUBLIC_SANITY_PROJECT_ID missing in .env");
    process.exit(1);
  }

  if (!token) {
    console.error(
      "ERROR: SANITY_TOKEN missing in .env\n" +
      "  Get a write token: https://sanity.io/manage → your project → API → Tokens → Add API token (Editor role)"
    );
    process.exit(1);
  }

  const client = createClient({
    projectId,
    dataset,
    apiVersion: "2025-01-01",
    useCdn: false,
    token,
  });

  // ── Seed into Sanity ──
  console.log(`\n─ Seeding ${documents.length} documents → ${projectId}/${dataset} ...`);

  const tx = client.transaction();
  for (const doc of documents) {
    tx.createOrReplace(doc);
  }

  await tx.commit();

  console.log("  ✅ All documents seeded successfully.");
  console.log(`  ✓ ${documents.length} documents created/updated.`);
  console.log("");
  console.log("  Next steps:");
  console.log("    pnpm dev                    — start Astro site at http://localhost:4321");
  console.log("    cd studio && npx sanity dev — start Sanity Studio at http://localhost:3333");
  console.log("");
  console.log("  Guide: open starter-content/guide.html in your browser for full setup docs.");
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
