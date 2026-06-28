# KapiLabs Astro Framework

CMS-agnostic website framework built on [Astro](https://astro.build). Connect any of four CMS backends without rebuilding your frontend.

**Supported CMS:** Sanity · WordPress · Contentful · EmDash  
**Version:** v4.0 | **Runtime:** Cloudflare Pages · **Storage:** Cloudflare D1 + R2

> **Repository status:** Private. You must be added as a collaborator to access it. Contact the repository owner at [kapisejix](https://github.com/kapisejix) to request access.

> **📖 Full documentation:** See [docs/index.html](./docs/index.html) for a comprehensive, non-technical guide covering pages, posts, testimonials, navigation, theme settings, plugins, widgets, forms, SEO, and more.

---

## Table of Contents

0. [📖 Full Documentation (docs/index.html)](./docs/index.html)

1. [Prerequisites](#1-prerequisites)
2. [Installation](#2-installation)
3. [Configure Environment Variables](#3-configure-environment-variables)
4. [Connect Sanity CMS](#4-connect-sanity-cms)
5. [Seed Starter Content](#5-seed-starter-content)
6. [Verify Everything Works](#6-verify-everything-works)
7. [Admin Panel](#7-admin-panel)
8. [Theme Customization](#8-theme-customization)
9. [Framework Integrations](#9-framework-integrations)
10. [Plugins](#10-plugins)
11. [Optional Features](#11-optional-features)
12. [Other CMS Backends](#12-other-cms-backends)
13. [Cloudflare Deployment](#13-cloudflare-deployment)
14. [Development Commands & CLI](#14-development-commands--cli)
15. [All Routes](#15-all-routes)
16. [Deployment (VPS / Docker)](#16-deployment-alternative--vps--docker)
17. [Project Structure](#17-project-structure)
18. [Troubleshooting](#18-troubleshooting)
19. [Features Overview](#19-features-overview)

---

## 1. Prerequisites

Install these before starting. Verify each with the version command shown.

| Tool | Minimum version | Install |
|------|----------------|---------|
| **Node.js** | 18.x or higher | [nodejs.org](https://nodejs.org) |
| **pnpm** | 8.x or higher | `npm install -g pnpm` |
| **Git** | any recent version | [git-scm.com](https://git-scm.com) |

```bash
# Verify you have the right versions
node -v        # should print v18.x or higher
pnpm -v        # should print 8.x or higher
git --version  # any version is fine
```

> **Windows users:** All commands work in PowerShell. Use PowerShell 5+ or Windows Terminal.

---

## 2. Installation

> **Note:** This repository is private. You need to be added as a collaborator before cloning. Contact the repository owner for access.

### Option A — From a local clone (recommended for developers with repo access)

If you already have the repo cloned at a local path, run the setup script pointing to it. This avoids re-downloading the repository.

**Windows (PowerShell):**
```powershell
# Clone the framework (skip if you already have it)
git clone https://github.com/kapisejix/kapilabs-astro-framework.git kapilabs

# Run setup — creates your project at E:\Projects\my-site
.\kapilabs\scripts\setup-kapilabs-project.ps1 -ProjectPath "E:\Projects\my-site" -SourcePath "E:\path\to\kapilabs"
```

**macOS / Linux:**
```bash
# Clone the framework (skip if you already have it)
git clone https://github.com/kapisejix/kapilabs-astro-framework.git kapilabs

# Run setup — creates your project at ~/projects/my-site
bash kapilabs/scripts/setup-kapilabs-project.sh -ProjectPath "$HOME/projects/my-site" -SourcePath "/path/to/kapilabs"
```

### Option B — Working directly inside the repo

If you want to develop inside the cloned repo itself (no separate project folder):

```bash
git clone https://github.com/kapisejix/kapilabs-astro-framework.git my-site
cd my-site
pnpm install
```

### What the setup script copies

The setup script copies these directories to your project folder:

| Copied | Purpose |
|--------|---------|
| `src/core/` | Framework core — all components, layouts, CMS adapters |
| `src/pages/` | Astro route files |
| `src/plugins/` | Built-in plugins (seo, forms, blog, testimonials) |
| `plugins/` | Example / marketplace plugins |
| `packages/` | Plugin SDK (`@kapilabs/plugin-sdk`) |
| `public/` | Static assets (favicon, theme assets) |
| `studio/` | Sanity Studio |
| `starter-content/` | Seed data + offline guide |
| `scripts/` | CLI and seed scripts |
| Root config files | `package.json`, `astro.config.mjs`, `tsconfig.json`, etc. |

> `src/theme/` is **never overwritten** — this is where your customizations live.

After copying, the script automatically runs `pnpm install` and creates `.env` from `.env.example`.

---

## 3. Configure Environment Variables

After installation, two `.env` files need to be filled in.

### 3.1 — Main `.env` (in your project root)

Open `.env` and set these values. The script creates this file automatically from `.env.example`.

```env
# ── Required ──────────────────────────────────────────────────────────────────

# Your site URL — used for JSON-LD, canonical URLs, sitemaps
# Use http://localhost:4321 for local development
SITE_URL=http://localhost:4321

# CMS backend to use (start with sanity — it has the most features)
# Options: sanity | wordpress | contentful | emdash
PUBLIC_CMS_BACKEND=sanity

# Admin panel password — CHANGE THIS to any strong random string
# You'll enter this at /admin/submissions to view form data
FORM_ADMIN_KEY=change-this-to-a-strong-secret

# ── Sanity (required if PUBLIC_CMS_BACKEND=sanity) ────────────────────────────

# Your Sanity Project ID — get it from sanity.io/manage → your project
PUBLIC_SANITY_PROJECT_ID=your-project-id-here

# Dataset name — leave as "production" unless you know you need another
PUBLIC_SANITY_DATASET=production

# API version — leave this as-is
PUBLIC_SANITY_API_VERSION=2025-01-01

# Editor token — required to seed content and for write operations
# Get it: sanity.io/manage → your project → API → Tokens → Add token (Editor role)
SANITY_TOKEN=

# ── Optional features (fill in if you need them) ──────────────────────────────

# Form storage backend: json (file) or sanity (stored in CMS)
FORM_STORAGE_BACKEND=json

# Email notifications for form submissions (leave blank to disable)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
FORM_EMAIL_TO=
FORM_EMAIL_FROM=

# Cloudflare Turnstile bot protection (leave blank to disable)
# Get keys at: dash.cloudflare.com → Turnstile
PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=

# Cloudflare D1 database ID (for production form storage)
CLOUDFLARE_D1_DATABASE_ID=
# Cloudflare R2 bucket name (for file uploads)
CLOUDFLARE_R2_BUCKET=

# CORS origins for API routes (comma-separated, leave blank to disable)
PUBLIC_KAPI_CORS=

# Plugins to enable (comma-separated, leave blank for none)
PUBLIC_KAPI_PLUGINS=
```

### 3.2 — Studio `.env` (inside the `studio/` folder)

```env
SANITY_STUDIO_PROJECT_ID=your-project-id-here
SANITY_STUDIO_DATASET=production
```

This must match the Project ID in your main `.env`.

---

## 4. Connect Sanity CMS

Sanity is the recommended CMS — it has the most complete feature implementation.

### Step 1 — Create a free Sanity project

1. Go to [sanity.io/manage](https://sanity.io/manage)
2. Click **New project** → give it any name
3. Choose **Production** dataset (or accept the default)
4. Copy the **Project ID** — it looks like `abc123de`

No credit card needed. The free tier is sufficient.

### Step 2 — Set your Project ID

In your main `.env`:
```env
PUBLIC_SANITY_PROJECT_ID=abc123de
```

In `studio/.env`:
```env
SANITY_STUDIO_PROJECT_ID=abc123de
```

### Step 3 — Start Sanity Studio

Open a terminal, navigate to the `studio/` folder, and run:

```bash
cd studio
npx sanity dev
```

Studio opens at **http://localhost:3333**. On first run it automatically deploys all schemas to your Sanity project. You will see a list of document types in the left sidebar — this means it worked.

> You do not need to run `sanity init` or configure schemas manually. They are pre-wired.

### Step 4 — Get an Editor token

You need a token to seed content and for the site to write form submissions to Sanity.

1. Go to [sanity.io/manage](https://sanity.io/manage) → your project
2. Click **API** → **Tokens** → **Add API token**
3. Name it anything, set role to **Editor**
4. Copy the token (it starts with `sk...`)

Add it to your main `.env`:
```env
SANITY_TOKEN=skYourTokenHere
```

### Step 5 — Add CORS origin for Studio

In Sanity Studio, go to **API** → **CORS origins** and add:
```
http://localhost:4321
```

This allows your Astro dev server to call the Sanity API.

---

## 5. Seed Starter Content

The seed script creates 17 ready-to-use documents in your Sanity project — pages, posts, menus, settings, team members, testimonials, and a contact form.

```bash
pnpm seed
```

**Preview before seeding (does not write anything):**
```bash
node scripts/seed-sanity.mjs --dry-run
```

What gets created:

| Document | What it contains |
|----------|-----------------|
| `siteSettings` | Site title, tagline, logo, contact info |
| `themeSettings` | Colors, typography, layout tokens |
| `testimonialSettings` | Default testimonial display config |
| `page` — home | Hero + Services + Stats + Testimonials + CTA + FAQ sections |
| `page` — about-us | Stats + CTA sections |
| `page` — contact-us | Contact form section |
| `page` — services | CTA section |
| `post` × 2 | Two full blog posts with content |
| `teamMember` × 2 | Jane Smith + Mark Johnson with bios |
| `form` | Contact form with name, email, message fields |
| `testimonial` × 3 | Three customer testimonials |
| `menu` — primary | Home, About Us, Services, Blog, Contact Us |
| `menu` — footer | Home, About Us, Services, Contact Us |

The seed script is **safe to rerun** — it uses `createOrReplace` so no duplicates are created.

---

## 6. Verify Everything Works

### Start the dev server

```bash
# In your project root (not studio/)
pnpm dev
```

The server starts at **http://localhost:4321**.

### What you should see

| URL | Expected result |
|-----|----------------|
| `http://localhost:4321` | Homepage with hero, services, and testimonials sections |
| `http://localhost:4321/about-us` | About page with stats section |
| `http://localhost:4321/blog` | Blog archive with two posts |
| `http://localhost:4321/contact-us` | Page with contact form |
| `http://localhost:4321/team` | Team page with Jane Smith and Mark Johnson |
| `http://localhost:4321/api/health` | JSON response: `{"ok":true,"status":"healthy"}` |
| `http://localhost:4321/admin/submissions` | Admin login page |

### If the homepage is blank or shows "Connect a CMS"

Check that:
1. `SANITY_TOKEN` is set in `.env`
2. `PUBLIC_SANITY_PROJECT_ID` matches your actual project ID
3. `pnpm seed` was run successfully
4. The CORS origin `http://localhost:4321` is added in Sanity manage

### Run the test suite

```bash
pnpm test
```

Should show: `5 test files passed, 114 tests passed`.

### Run the type checker

```bash
pnpm typecheck
```

Should show: `Result (211 files): 0 errors`.

---

## 7. Admin Panel

The admin panel is protected by the `FORM_ADMIN_KEY` you set in `.env`. There are no user accounts — just a single shared key.

### How to log in

Visit any admin URL. You will see a login form. Enter the value of `FORM_ADMIN_KEY` from your `.env` file. The session lasts 15 minutes.

### Admin routes

| URL | What it does |
|-----|-------------|
| `/admin/submissions` | View all form submissions, search and filter by form name |
| `/admin/theme` | Export current theme settings as JSON / import from JSON |
| `/admin/plugins` | Browse and install marketplace plugins |

### Export form submissions as CSV

From `/admin/submissions`, click **Export CSV**. All submissions download as a spreadsheet.

You can also fetch it directly from the API:
```bash
curl -H "x-admin-key: YOUR_KEY" https://yourdomain.com/api/forms/export
```

### Export and import theme settings

**Export current theme:**
```bash
# Downloads theme-export-YYYY-MM-DD.json
curl -H "x-admin-key: YOUR_KEY" https://yourdomain.com/admin/theme-export.json -o theme.json
```

**Validate and preview an import:**
```bash
# Preview what would change (nothing is written)
pnpm kapi import-theme theme-export-2025-01-01.json

# Import in replace mode (overwrites all settings)
pnpm kapi import-theme theme-export-2025-01-01.json --mode=replace
```

> The dev server must be running for `kapi import-theme` to work. Set `FORM_ADMIN_KEY` in your environment.

---

## 8. Theme Customization

KapiLabs uses a parent-child architecture. Your customizations live in `src/theme/` and are never touched by framework updates.

### How it works

| Layer | Path | Rule |
|-------|------|------|
| **Core (parent)** | `src/core/` | Framework files. Never edit these directly. |
| **Theme (child)** | `src/theme/` | Your overrides. Safe from framework updates. |

Every component import goes through `@kapi/`. The resolver checks `src/theme/` first, then falls back to `src/core/`. If you create `src/theme/components/Header.astro`, it replaces the core header everywhere — no import changes needed.

### Override a component

Copy the file you want to customize from `src/core/` to the same path under `src/theme/`:

**Windows:**
```powershell
# Example: override the Header
New-Item -ItemType Directory -Force src\theme\components
Copy-Item src\core\components\Header.astro src\theme\components\Header.astro
```

**macOS / Linux:**
```bash
mkdir -p src/theme/components
cp src/core/components/Header.astro src/theme/components/Header.astro
```

Now edit `src/theme/components/Header.astro` freely. The core file is untouched.

### Common overrides

| What to change | Copy from | Copy to |
|----------------|-----------|---------|
| Global CSS styles | `src/core/styles/global.css` | `src/theme/styles/global.css` |
| Header | `src/core/components/Header.astro` | `src/theme/components/Header.astro` |
| Footer | `src/core/components/Footer.astro` | `src/theme/components/Footer.astro` |
| Hero section | `src/core/sections/HeroSection.astro` | `src/theme/sections/HeroSection.astro` |
| Blog post layout | `src/core/blog-templates/BlogSingle.astro` | `src/theme/blog-templates/BlogSingle.astro` |
| Theme CSS variables | `src/core/theme/ThemeVariables.astro` | `src/theme/theme/ThemeVariables.astro` |

See `src/theme/CUSTOMIZE.md` for the full list of all overridable files.

### Scaffold a child theme

```bash
pnpm kapi generate child-theme my-brand
```

Creates starter files in `src/theme/` including `global.css` and `ThemeVariables.astro`.

### Update the framework

Re-run the setup script. `src/core/` is updated. `src/theme/` is never touched.

```powershell
# Windows
.\scripts\setup-kapilabs-project.ps1 -ProjectPath "E:\Projects\my-site" -SourcePath "E:\path\to\kapilabs"
```

```bash
# macOS / Linux
bash scripts/setup-kapilabs-project.sh -ProjectPath "$HOME/projects/my-site" -SourcePath "/path/to/kapilabs"
```

---

## 9. Framework Integrations

The KapiLabs framework is built on Astro, which supports a wide range of UI frameworks for interactive components. You can mix multiple frameworks in the same project — Astro renders the static HTML and the framework handles client-side interactivity.

### Tailwind CSS (pre-installed)

Tailwind CSS v4 is already included and configured. You do not need to install anything.

- **Package:** `tailwindcss` + `@tailwindcss/vite` (already in `package.json`)
- **Config:** The `@tailwindcss/vite` plugin is wired in `astro.config.mjs`
- **Usage:** The `global.css` starts with `@import "tailwindcss"` — ready to use in any `.astro`, `.tsx`, or `.jsx` file

```css
/* src/core/styles/global.css — already set up */
@import "tailwindcss";
```

To customize Tailwind, create a `src/theme/styles/global.css` override (see [Theme Customization](#8-theme-customization)) and add your theme configuration there:

```css
/* src/theme/styles/global.css */
@import "tailwindcss";

@theme {
  --color-primary: #6366f1;
  --color-secondary: #ec4899;
  --font-family-display: "Inter", sans-serif;
}
```

> **Important:** Tailwind v4 uses `@import "tailwindcss"` with the `@tailwindcss/vite` plugin — no `tailwind.config.js` file needed. All customization goes in CSS using `@theme` directives.

---

### Adding React

React lets you build interactive UI components with a rich ecosystem of libraries.

```bash
pnpm astro add react
```

This automatically:
1. Installs `@astrojs/react`, `react`, `react-dom`
2. Adds the React integration to `astro.config.mjs`
3. Enables `.tsx` / `.jsx` file support

**Create a React component in your theme:**

```tsx
// src/theme/components/Counter.tsx
import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  );
}
```

**Use it in an Astro page:**

```astro
---
import Counter from "@kapi/components/Counter.tsx";
---

<!-- Hydrates on page load -->
<Counter client:load />

<!-- Hydrates when visible in viewport -->
<Counter client:visible />

<!-- Hydrates when the page is idle -->
<Counter client:idle />
```

---

### Adding Vue

```bash
pnpm astro add vue
```

Creates `.vue` single-file components. Supports both Options API and Composition API.

```vue
<!-- src/theme/components/LikeButton.vue -->
<script setup>
import { ref } from "vue";
const liked = ref(false);
</script>

<template>
  <button @click="liked = !liked" :class="{ active: liked }">
    {{ liked ? "Liked!" : "Like" }}
  </button>
</template>
```

```astro
---
import LikeButton from "@kapi/components/LikeButton.vue";
---

<LikeButton client:visible />
```

---

### Adding Svelte

```bash
pnpm astro add svelte
```

Creates `.svelte` components with a compiled, minimal-runtime approach — excellent for performant interactive widgets.

```svelte
<!-- src/theme/components/ThemeToggle.svelte -->
<script>
  let dark = $state(false);
</script>

<button onclick={() => dark = !dark}>
  {dark ? "☀️ Light" : "🌙 Dark"}
</button>
```

```astro
---
import ThemeToggle from "@kapi/components/ThemeToggle.svelte";
---

<ThemeToggle client:load />
```

---

### Adding Preact

```bash
pnpm astro add preact
```

Preact is a lightweight React alternative (3 KB) with the same API. Use it if you want React-like components with a smaller bundle size.

Works with `.jsx` / `.tsx` files — same syntax as React, including `useState`, `useEffect`, and hooks.

---

### Adding Solid.js

```bash
pnpm astro add solid
```

Solid.js provides fine-grained reactivity without a virtual DOM — ideal for highly interactive components with minimal overhead.

```tsx
// src/theme/components/SearchInput.tsx
import { createSignal } from "solid-js";

export default function SearchInput() {
  const [query, setQuery] = createSignal("");
  return (
    <input
      type="search"
      value={query()}
      onInput={(e) => setQuery(e.currentTarget.value)}
      placeholder="Search..."
    />
  );
}
```

```astro
---
import SearchInput from "@kapi/components/SearchInput.tsx";
---

<SearchInput client:idle />
```

---

### Client Directives Reference

Astro provides several "client:" directives to control when framework components hydrate:

| Directive | When it hydrates | Best for |
|-----------|-----------------|----------|
| `client:load` | Immediately on page load | Critical interactive elements (navigation, forms) |
| `client:idle` | When the browser is idle (after page load) | Non-critical widgets (search, share buttons) |
| `client:visible` | When the element scrolls into the viewport | Below-the-fold content (footers, sidebars) |
| `client:media={condition}` | When a media query matches | Responsive components (mobile-only menus) |
| `client:only="react"` | Client-side only, skip SSR | Components that use `window` or browser APIs |

---

### Using framework components together

Astro allows mixing components from different frameworks on the same page:

```astro
---
import ReactCounter from "@kapi/components/Counter.tsx";
import VueLikeButton from "@kapi/components/LikeButton.vue";
import SvelteToggle from "@kapi/components/ThemeToggle.svelte";
---

<ReactCounter client:load />
<VueLikeButton client:visible />
<SvelteToggle client:idle />
```

Each component hydrates independently. There is no cross-framework overhead — each framework's runtime is loaded only when a component using it is present on the page.

---

## 10. Plugins

Plugins add optional functionality — shortcodes, widget types, and CSS variable sets — without modifying core files.

### Enable built-in plugins

Add plugin keys (comma-separated) to your `.env`:

```env
PUBLIC_KAPI_PLUGINS=kapilabs-plugin-seo,kapilabs-plugin-forms,kapilabs-plugin-blog,kapilabs-plugin-testimonials
```

| Plugin key | What it adds |
|------------|-------------|
| `kapilabs-plugin-seo` | Enhanced JSON-LD schema injection |
| `kapilabs-plugin-forms` | Additional form field types and hooks |
| `kapilabs-plugin-blog` | Reading time, related posts, `[kapi_posts]` shortcode |
| `kapilabs-plugin-testimonials` | `[kapi_testimonials_plugin]` shortcode, external review sources |
| `kapilabs-plugin-gallery` | Example plugin — image gallery shortcode |

### Build your own plugin

```bash
pnpm kapi generate plugin my-plugin
```

Scaffolds `plugins/my-plugin/index.ts`. The generated file uses `@kapilabs/plugin-sdk` (located at `packages/plugin-sdk/`):

```typescript
import { definePlugin } from "@kapilabs/plugin-sdk";

export default definePlugin({
  name: "kapilabs-plugin-my-plugin",
  register(ctx) {
    // Register a shortcode: [kapi_my_shortcode]
    ctx.registerShortcode("kapi_my_shortcode", (attrs) => {
      return `<div class="my-shortcode">${attrs.text || ""}</div>`;
    });

    // Register CSS variables
    ctx.registerCssVars({ "--my-color": "#6366f1" });
  },
});
```

Then add your plugin to the loader in `src/core/plugins/loader.ts` and enable it via `PUBLIC_KAPI_PLUGINS`.

### Install marketplace plugins

```bash
pnpm kapi install <package-name>
pnpm kapi search gallery
pnpm kapi list plugins
```

---

## 11. Optional Features

All optional features are disabled by default and activated by setting environment variables.

### Form email notifications (SMTP)

When a form is submitted, send an email notification to a specified address.

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password
FORM_EMAIL_TO=you@yourdomain.com
FORM_EMAIL_FROM=noreply@yourdomain.com
```

> For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833), not your regular password.

### Bot protection (Cloudflare Turnstile)

Turnstile is a free, privacy-friendly CAPTCHA alternative. When configured, all form submissions require a Turnstile challenge.

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → **Turnstile** → **Add site**
2. Copy the Site Key and Secret Key

```env
PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAAAxxx
TURNSTILE_SECRET_KEY=0x4AAAAAAAxxx
```

When both keys are set, Turnstile activates automatically. Without keys it is silently skipped (form submissions still work).

### Store form submissions in Sanity

By default, submissions are saved to a local JSON file. To store them in Sanity instead:

```env
FORM_STORAGE_BACKEND=sanity
```

Requires `SANITY_TOKEN` with Editor permissions.

### CORS for API routes

If you have a separate frontend calling the API:

```env
PUBLIC_KAPI_CORS=https://your-frontend.com,https://staging.your-frontend.com
```

Use `*` to allow any origin (not recommended for production):
```env
PUBLIC_KAPI_CORS=*
```

---

## 12. Other CMS Backends

Switch the CMS backend by changing `PUBLIC_CMS_BACKEND` in `.env`:

```env
PUBLIC_CMS_BACKEND=wordpress  # or contentful | emdash | sanity
```

### WordPress (headless)

Requires WordPress with the REST API enabled (default in WordPress 5+).

```env
PUBLIC_CMS_BACKEND=wordpress
WORDPRESS_API_URL=https://yourdomain.com/wp-json/wp/v2
```

No additional plugins needed. The WordPress REST API is used directly.

> Note: Advanced search is not yet implemented for WordPress. It returns empty data.

### Contentful

```env
PUBLIC_CMS_BACKEND=contentful
CONTENTFUL_SPACE_ID=your-space-id
CONTENTFUL_ACCESS_TOKEN=your-delivery-api-key
CONTENTFUL_ENVIRONMENT=master
```

Get these from your Contentful space settings → **API keys**.

### EmDash

```env
PUBLIC_CMS_BACKEND=emdash
EMDASH_API_URL=https://your-emdash-instance.com/api
```

### Which CMS has the most features?

| Feature | Sanity | WordPress | Contentful | EmDash |
|---------|--------|-----------|------------|--------|
| Pages, Posts, Menus | ✅ | ✅ | ✅ | ✅ |
| Advanced search | ✅ | Stub | Stub | Stub |
| Saved sections | ✅ | — | ✅ | ✅ |

Sanity is the most complete backend. All others are functional for core content.

---

## 13. Cloudflare Deployment

The project comes pre-configured for Cloudflare Pages with bindings for D1, R2, and KV. The adapter is already installed and configured.

### Architecture

| Service | Binding | Purpose |
|---------|---------|---------|
| **D1** (SQLite database) | `DB` | Form submissions, structured data, bookings |
| **R2** (object storage) | `BUCKET` | Images, PDFs, file uploads |
| **KV** (key-value store) | `KV` | Sessions, cache, feature flags, rate limits |

### Prerequisites

- A [Cloudflare account](https://dash.cloudflare.com) (free tier works)
- `wrangler` CLI: `npm install -g wrangler` or `npx wrangler`

### Step 1 — Configure `wrangler.toml`

A `wrangler.toml` is already in the project root with placeholder IDs. Create the actual Cloudflare resources and update the IDs:

```bash
# Create D1 database — copy the database_id from the output
npx wrangler d1 create kapilabs-db

# Create R2 bucket
npx wrangler r2 bucket create kapilabs-assets

# Create KV namespace — copy the id from the output
npx wrangler kv namespace create kapilabs-sessions
```

Edit `wrangler.toml` and replace `your-d1-database-id` and `your-kv-namespace-id` with the actual IDs:

```toml
name = "kapilabs"
compatibility_date = "2026-04-20"
compatibility_flags = ["nodejs_compat"]

[[d1_databases]]
binding = "DB"
database_name = "kapilabs-db"
database_id = "<paste-database-id-here>"

[[r2_buckets]]
binding = "BUCKET"
bucket_name = "kapilabs-assets"

[[kv_namespaces]]
binding = "KV"
id = "<paste-namespace-id-here>"
```

### Step 2 — Adapter configuration

The `astro.config.mjs` is already configured with the Cloudflare adapter:

```js
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  output: "server",
  adapter: cloudflare({
    mode: "directory",      // Pages Functions mode
    runtime: "local",        // Local workerd emulation
  }),
  // ...
});
```

- `mode: "directory"` — each route becomes a separate Pages Function file
- `runtime: "local"` — uses `workerd` for local development (matches Cloudflare's runtime behavior)

### Step 3 — TypeScript types for bindings

`src/env.d.ts` already declares typed bindings via `App.Env`:

```typescript
/// <reference types="astro/client" />
/// <reference types="@astrojs/cloudflare" />

declare namespace App {
  interface Env {
    DB: import("@cloudflare/workers-types").D1Database;
    BUCKET: import("@cloudflare/workers-types").R2Bucket;
    KV: import("@cloudflare/workers-types").KVNamespace;
  }

  interface Locals {
    site: import("./core/multisite/types").KapiSiteContext | null;
  }
}
```

The `@cloudflare/workers-types` package (dev dependency) provides full type definitions for all Cloudflare runtime APIs.

### Step 4 — Access Cloudflare bindings in code

```astro
---
// In any Astro page or API route
const { DB, BUCKET, KV } = Astro.locals.runtime.env;

// Query D1 database
const { results } = await DB.prepare(
  "SELECT * FROM form_submissions ORDER BY created_at DESC"
).all();

// Read from R2 bucket
const file = await BUCKET.get("uploads/photo.jpg");

// Use KV for caching or session data
await KV.put("theme:settings", JSON.stringify(themeData));
const cached = await KV.get("theme:settings");
---
```

### Step 5 — Deploy to Cloudflare Pages

```bash
pnpm build
npx wrangler pages deploy dist/ --branch main
```

Or connect your GitHub repository for automatic deployments:

1. Go to **Cloudflare Dashboard** → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. Select your repository
3. Set **Build command**: `pnpm build`
4. Set **Build output directory**: `dist/`
5. Under **Environment variables**, add all your `.env` values:
   - `PUBLIC_SANITY_PROJECT_ID`, `PUBLIC_SANITY_DATASET`, `SANITY_TOKEN`
   - `FORM_ADMIN_KEY`, `PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`
6. Under **Bindings (Production)**, add:
   - **D1 database** — variable name: `DB`, binding type: D1 database
   - **R2 bucket** — variable name: `BUCKET`, binding type: R2 bucket
   - **KV namespace** — variable name: `KV`, binding type: KV namespace

### Local development with Cloudflare bindings

```bash
# Starts the dev server with wrangler reading wrangler.toml for bindings
npx wrangler pages dev -- pnpm dev
```

This provides local emulation of D1, R2, and KV based on your `wrangler.toml` configuration.

### Important deployment notes

- **Environment variables** must be set in the Cloudflare dashboard or CLI — `.env` files are not read in production
- **Bindings** must be added in **both** `wrangler.toml` (local dev) and the Cloudflare dashboard (production)
- The `nodejs_compat` compatibility flag enables `node:crypto`, `process.env`, and other Node.js APIs on Cloudflare Workers
- `output: "server"` is required for SSR. Do not change to `"static"` — it disables all API routes, form endpoints, and admin routes

---

## 14. Development Commands & CLI

### Standard commands

```bash
pnpm dev          # Start dev server at http://localhost:4321
pnpm build        # Production build (output in dist/)
pnpm preview      # Serve the production build locally
pnpm typecheck    # TypeScript + Astro type check (expects 0 errors)
pnpm test         # Run unit tests (expects 114/114 passing)
pnpm test --coverage    # Tests with coverage report
pnpm qa           # Run typecheck + test + build (full pre-deploy gate)
pnpm seed         # Seed Sanity with starter content
```

**Sanity Studio (run from `studio/` folder):**
```bash
cd studio
npx sanity dev      # Studio at http://localhost:3333
npx sanity deploy   # Deploy Studio to sanity.studio (online hosting)
```

**Dry run seed (no credentials needed):**
```bash
node scripts/seed-sanity.mjs --dry-run
```

### KapiLabs CLI (`pnpm kapi`)

```bash
pnpm kapi help                          # Show all commands and examples

# Generators
pnpm kapi generate child-theme <name>   # Scaffold a child theme in src/theme/
pnpm kapi generate plugin <name>        # Scaffold a new plugin in plugins/<name>/
# Marketplace
pnpm kapi install <package>             # Install a marketplace package
pnpm kapi install <package> --force     # Install even if security scan fails
pnpm kapi search [query]                # Search the marketplace
pnpm kapi list [type]                   # List packages by type (themes, plugins, etc.)

# Theme
pnpm kapi import-theme <file.json>              # Validate and apply a theme JSON export
pnpm kapi import-theme <file.json> --mode=replace  # Overwrite all settings
```

> `kapi import-theme` requires the dev server to be running (`pnpm dev`) and `FORM_ADMIN_KEY` set in your environment.

---

## 15. All Routes

### Public routes

| Route | Description |
|-------|-------------|
| `/` | Homepage (CMS home page slug) |
| `/[...slug]` | Any CMS page by slug |
| `/blog` | Blog archive |
| `/blog/[slug]` | Single blog post |
| `/category/[slug]` | Posts by category |
| `/tag/[slug]` | Posts by tag |
| `/search` | Faceted search (type, category, tag, date, pagination) |
| `/team` | Team member listing |
| `/team/[slug]` | Single team member profile |
| `/sitemap.xml` | Auto-generated sitemap from CMS |
| `/robots.txt` | Auto-generated robots file (blocks `/admin/`) |

### API routes

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/health` | GET | None | Returns `{"ok":true}` — use for uptime monitoring |
| `/api/forms/submit` | POST | CSRF token | Submit a form (rate limited, Turnstile optional) |
| `/api/forms/export` | GET | `x-admin-key` header | Download all form submissions as CSV |

### Admin routes (require `FORM_ADMIN_KEY`)

| Route | Description |
|-------|-------------|
| `/admin/submissions` | View and search all form submissions |
| `/admin/theme` | Export / import theme settings as JSON |
| `/admin/plugins` | Browse and install marketplace plugins |
| `/admin/theme-export.json` | GET — Download theme as JSON file |
| `/admin/theme-import.json` | POST — Validate a theme JSON import |

---

## 16. Deployment (Alternative — VPS / Docker)

### Node.js on a VPS or Docker (current method)

Build the project and run the Node.js server:

```bash
pnpm build
node ./dist/server/entry.mjs
```

Before starting, set all your `.env` variables as real environment variables in your server environment (not as a `.env` file — that is for development only).

**Example with environment variables:**
```bash
export SITE_URL=https://yourdomain.com
export PUBLIC_CMS_BACKEND=sanity
export PUBLIC_SANITY_PROJECT_ID=abc123de
export PUBLIC_SANITY_DATASET=production
export SANITY_TOKEN=skYourToken
export FORM_ADMIN_KEY=your-strong-secret
node ./dist/server/entry.mjs
```

**Docker example:**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY dist/ ./dist/
COPY package.json ./
RUN npm install --only=production
EXPOSE 4321
CMD ["node", "./dist/server/entry.mjs"]
```

The server listens on port `4321` by default. Put a reverse proxy (nginx, Caddy) in front of it for HTTPS.

### PM2 (process manager for VPS)

```bash
pnpm build
pm2 start ./dist/server/entry.mjs --name kapilabs --env production
pm2 save
pm2 startup
```

### Important deployment notes

- `output: "server"` is required (already configured). Do not change to `"static"` — it disables all API routes, form endpoints, and admin routes.
- Copy `pnpm-lock.yaml` to production and run `pnpm install --frozen-lockfile` for reproducible installs.
- HTTPS is required for `Secure` cookies (admin session and CSRF tokens).

---

## 17. Project Structure

```
your-project/
├── src/
│   ├── pages/                    # Astro route files — do not edit
│   │   ├── index.astro           # Homepage
│   │   ├── [...slug].astro       # Dynamic CMS pages
│   │   ├── blog/                 # Blog routes
│   │   ├── admin/                # Admin panel pages
│   │   └── api/                  # API endpoints
│   │
│   ├── core/                     # Framework — do not edit directly
│   │   ├── cms/                  # CMS adapters + types
│   │   │   ├── sanity/           # Sanity adapter (queries, mappers, client)
│   │   │   ├── wordpress.ts      # WordPress adapter
│   │   │   ├── contentful.ts     # Contentful adapter
│   │   │   ├── emdash.ts         # EmDash adapter
│   │   │   └── types.ts          # Shared CMS type definitions
│   │   ├── components/           # Header, Footer, CmsImage, WidgetArea, etc.
│   │   ├── forms/                # Form system (CSRF, validation, rate limiting, storage)
│   │   ├── layouts/              # BaseLayout, SiteLayout, 7 layout variants
│   │   ├── mailer/               # SMTP email notifications
│   │   ├── marketplace/          # Plugin marketplace registry + security scanner
│   │   ├── plugins/              # Plugin registry + loader
│   │   ├── sections/             # 12 page section types
│   │   ├── seo/                  # SeoHead, JSON-LD schema builders
│   │   ├── shortcodes/           # 11 shortcodes + async resolver
│   │   └── theme/                # ThemeVariables, widget areas, export-import
│   │
│   ├── plugins/                  # Built-in plugins
│   │   ├── seo/                  # kapilabs-plugin-seo
│   │   ├── forms/                # kapilabs-plugin-forms
│   │   ├── blog/                 # kapilabs-plugin-blog
│   │   └── testimonials/         # kapilabs-plugin-testimonials
│   │
│   ├── theme/                    # YOUR CUSTOMIZATIONS — safe from updates
│   │   └── CUSTOMIZE.md          # Full list of overridable files
│   │
│   └── middleware.ts             # Security headers
│
├── plugins/                      # Marketplace / example plugins
│   └── example-gallery/          # Reference plugin implementation
│
├── packages/
│   └── plugin-sdk/               # @kapilabs/plugin-sdk — build your own plugins
│
├── studio/                       # Sanity Studio
│   ├── schemaTypes/              # Content type definitions (pre-wired)
│   └── sanity.config.ts          # Studio configuration
│
├── starter-content/              # Seed data for Sanity
│   ├── guide.html                # Full setup guide (open in browser, works offline)
│   ├── pages/                    # Page markdown files
│   ├── posts/                    # Blog post markdown files
│   └── starter.config.json       # Menu and settings config
│
├── scripts/
│   ├── seed-sanity.mjs           # pnpm seed / --dry-run
│   ├── kapi.mjs                  # pnpm kapi CLI
│   ├── setup-kapilabs-project.ps1   # Windows setup script
│   └── setup-kapilabs-project.sh    # macOS/Linux setup script
│
├── docs/                         # Additional documentation
│   ├── issues-found.md           # Audit report and issue tracking
│   ├── latest-audit.md           # Security audit report
│   └── SECURITY.md               # Security hardening guide
│
├── .env                          # Your environment variables (never commit this)
├── .env.example                  # Template — copy to .env and fill in
├── astro.config.mjs              # Astro + Vite configuration
├── package.json                  # Dependencies and scripts
├── pnpm-lock.yaml                # Commit this — ensures reproducible installs
├── pnpm-workspace.yaml           # Workspace config (includes packages/)
└── tsconfig.json                 # TypeScript configuration
```

---

## 18. Troubleshooting

### Pages are empty or show "Connect a CMS"

- Check that `PUBLIC_SANITY_PROJECT_ID` is correct in `.env`
- Check that `pnpm seed` completed without errors
- Check that `http://localhost:4321` is added to CORS origins in Sanity manage
- Restart the dev server after changing `.env`

### `pnpm install` fails

- Make sure pnpm is version 8 or higher: `pnpm -v`
- Try: `pnpm install --no-frozen-lockfile`
- Delete `node_modules/` and `pnpm-lock.yaml` then run `pnpm install` again

### Sanity Studio shows "Schema errors"

- Make sure both `.env` files are filled in (project root and `studio/`)
- The Project IDs must match exactly
- Run `npx sanity manage` in the `studio/` folder to check project status

### Form submissions are not being saved

- Check `FORM_ADMIN_KEY` is set
- If `FORM_STORAGE_BACKEND=sanity`, ensure `SANITY_TOKEN` has Editor permissions
- For JSON storage, the file is at `data/form-submissions.json` (auto-created)

### Admin login says "Invalid admin key"

- The key you enter must exactly match `FORM_ADMIN_KEY` in your `.env`
- After changing `.env`, restart the dev server
- The session cookie expires after 15 minutes — log in again if it has been idle

### TypeScript errors on `pnpm typecheck`

- Make sure `pnpm install` was run after any changes to `package.json` or `pnpm-workspace.yaml`
- Run `pnpm typecheck` and fix errors before building

### Build fails with "Cannot find module"

- Run `pnpm install` first
- Check that `packages/` is listed in `pnpm-workspace.yaml` under `packages:`
- If you added a new plugin, make sure it is listed in `src/core/plugins/loader.ts`

### Theme override has no matching core file (build warning)

If you see:
```
⚠ [KapiLabs] Theme override has no matching core file: src/theme/sections/X.astro
```
This means a file in `src/theme/` does not have a corresponding file in `src/core/`. The override has no effect. Either create the matching core file or remove the theme file.

---

## 19. Features Overview

### Page building
- 12 section types: hero, content, services, CTA, testimonials, HTML embed, stats, FAQ, team, blog-preview, contact, form
- 7 layout variants: content-sidebar, sidebar-content, full-width, landing, blank, double-sidebar, content
- Dynamic query sections — filter by category, tag, author, or featured flag
- 11 built-in shortcodes: `[kapi_posts]`, `[kapi_team]`, `[kapi_section]`, `[kapi_form]`, `[kapi_video]`, `[kapi_gallery]`, `[kapi_cta]`, `[kapi_services]`, `[kapi_testimonials]`, `[kapi_map]`, `[kapi_testimonials_plugin]`

### Navigation
- Desktop mega menu with column grid layout (CSS-only, no JavaScript)
- Mobile menu using `<details>` toggle (no JavaScript, accessible)
- Off-canvas drawer menu — `role="dialog"`, focus trap, ESC to close
- 20 widget areas, 13 menu locations (primary, secondary, footer, mobile, utility, top-bar, social, legal, sidebar, off-canvas, after-footer, blog-sidebar, page-sidebar)

### Forms
- CSRF token protection on all endpoints
- Zod schema validation + `sanitize-html` XSS stripping
- Field-level validation against CMS-defined field types
- Rate limiting (10 submissions/min per IP)
- Optional Cloudflare Turnstile bot protection
- Storage backends: JSON file or Sanity
- SMTP email notifications
- Admin CSV export

### SEO
- `<SeoHead>` component — title, description, canonical, OG tags, Twitter Cards
- JSON-LD structured data — Organization, WebSite, Article, FAQPage, HowTo, Person, BreadcrumbList
- Auto-generated `/robots.txt` (blocks `/admin/`) and `/sitemap.xml`

### Security
- CSRF protection on all forms
- HMAC-SHA256 signed admin session tokens (15-minute expiry)
- Timing-safe key comparisons (prevents timing attacks)
- Rate limiting on form submissions and login attempts
- Security headers on all responses: CSP, HSTS, X-Frame-Options, Permissions-Policy, X-Content-Type-Options, Referrer-Policy
- `HttpOnly + Secure + SameSite=Strict` cookies
- Admin routes blocked from search engine indexing

### Plugin system
- 4 built-in plugins: seo, forms, blog, testimonials
- Plugin SDK (`@kapilabs/plugin-sdk`) — register shortcodes, CSS variables, widget areas
- CLI scaffolding: `pnpm kapi generate plugin <name>`
- Marketplace: `pnpm kapi install <package>`

### Performance
- Astro SSR + islands architecture — minimal JavaScript sent to browser
- Shared chunk splitting for Sanity client and vendor libraries
- LQIP (Low Quality Image Placeholder) support for Sanity images
- Focal point cropping support for CMS images

### Accessibility
- Skip-to-content link on every page
- ARIA landmarks, `aria-current` on breadcrumbs and active nav links
- Focus trap and ESC close on off-canvas menu
- All CSS animations respect `prefers-reduced-motion`

---

## License

See [LICENSE](./LICENSE).
