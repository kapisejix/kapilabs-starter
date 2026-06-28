# KapiLabs Starter

Astro + Sanity theme framework. Clone it, connect a CMS, deploy to Cloudflare in minutes.

**Supported CMS:** Sanity (recommended) · WordPress · Contentful · EmDash  
**Deploy target:** Cloudflare Pages · **Storage:** Cloudflare D1 + R2 + KV  
**Version:** v4.0

---

## Table of Contents

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

```bash
git clone https://github.com/kapisejix/kapilabs-starter.git my-site
cd my-site
pnpm install
```

Copy the environment template:

**macOS / Linux:**
```bash
cp .env.example .env
cp studio/.env.example studio/.env
```

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
Copy-Item studio/.env.example studio/.env
```

Then fill in the values — see [Section 3](#3-configure-environment-variables).

---

## 3. Configure Environment Variables

After installation, two `.env` files need to be filled in.

### 3.1 — Main `.env` (project root)

```env
# ── Required ──────────────────────────────────────────────────────────────────

# Your site URL — use http://localhost:4321 for local development
SITE_URL=http://localhost:4321

# CMS backend (start with sanity — most complete)
# Options: sanity | wordpress | contentful | emdash
PUBLIC_CMS_BACKEND=sanity

# Admin panel password — change this to any strong random string
FORM_ADMIN_KEY=change-this-to-a-strong-secret

# ── Sanity (required if PUBLIC_CMS_BACKEND=sanity) ────────────────────────────

# Your Sanity Project ID — get it from sanity.io/manage → your project
PUBLIC_SANITY_PROJECT_ID=your-project-id-here

# Dataset name — leave as "production" unless you need another
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

### 3.2 — Studio `.env` (inside `studio/` folder)

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

```bash
cd studio
npx sanity dev
```

Studio opens at **http://localhost:3333**. On first run it automatically deploys all schemas to your Sanity project. You will see a list of document types in the left sidebar — this means it worked.

> You do not need to run `sanity init` or configure schemas manually. They are pre-wired.

### Step 4 — Get an Editor token

1. Go to [sanity.io/manage](https://sanity.io/manage) → your project
2. Click **API** → **Tokens** → **Add API token**
3. Name it anything, set role to **Editor**
4. Copy the token (starts with `sk...`)

Add it to your main `.env`:
```env
SANITY_TOKEN=skYourTokenHere
```

### Step 5 — Add CORS origin for Studio

In [sanity.io/manage](https://sanity.io/manage) → your project → **API** → **CORS origins**, add:
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
pnpm dev
```

Server starts at **http://localhost:4321**.

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
3. `pnpm seed` completed without errors
4. The CORS origin `http://localhost:4321` is added in Sanity manage

### Run the type checker

```bash
pnpm typecheck
```

Should show: `Result (211 files): 0 errors`.

---

## 7. Admin Panel

The admin panel is protected by the `FORM_ADMIN_KEY` you set in `.env`. No user accounts — just a single shared key.

### How to log in

Visit any admin URL. Enter the value of `FORM_ADMIN_KEY` from your `.env` file. Session lasts 15 minutes.

### Admin routes

| URL | What it does |
|-----|-------------|
| `/admin/submissions` | View all form submissions, search and filter by form name |
| `/admin/theme` | Export current theme settings as JSON / import from JSON |
| `/admin/plugins` | Browse and install marketplace plugins |

### Export form submissions as CSV

From `/admin/submissions`, click **Export CSV**. Or fetch it directly:
```bash
curl -H "x-admin-key: YOUR_KEY" https://yourdomain.com/api/forms/export
```

### Export and import theme settings

**Export current theme:**
```bash
curl -H "x-admin-key: YOUR_KEY" https://yourdomain.com/admin/theme-export.json -o theme.json
```

**Import:**
```bash
# Preview what would change (nothing is written)
pnpm kapi import-theme theme-export-2025-01-01.json

# Apply (overwrites all settings)
pnpm kapi import-theme theme-export-2025-01-01.json --mode=replace
```

> `kapi import-theme` requires the dev server to be running (`pnpm dev`) and `FORM_ADMIN_KEY` set in your environment.

---

## 8. Theme Customization

KapiLabs uses a parent-child architecture. Your customizations live in `src/theme/` and are never overwritten by framework updates.

### How it works

| Layer | Path | Rule |
|-------|------|------|
| **Core (parent)** | `src/core/` | Framework files — never edit directly |
| **Theme (child)** | `src/theme/` | Your overrides — safe from updates |

Every import goes through `@kapi/`. The resolver checks `src/theme/` first, then falls back to `src/core/`. If you create `src/theme/components/Header.astro`, it replaces the core header everywhere — no import changes needed.

### Override a component

Copy the file from `src/core/` to the same path under `src/theme/`:

**macOS / Linux:**
```bash
mkdir -p src/theme/components
cp src/core/components/Header.astro src/theme/components/Header.astro
```

**Windows (PowerShell):**
```powershell
New-Item -ItemType Directory -Force src\theme\components
Copy-Item src\core\components\Header.astro src\theme\components\Header.astro
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

See `src/theme/CUSTOMIZE.md` for the full list of overridable files.

### Scaffold a child theme

```bash
pnpm kapi generate child-theme my-brand
```

Creates starter files in `src/theme/` including `global.css` and `ThemeVariables.astro`.

---

## 9. Framework Integrations

Astro supports mixing multiple UI frameworks in the same project. Install any you need.

### Tailwind CSS (pre-installed)

Tailwind CSS v4 is already included and configured — no setup needed.

To customize, create a theme override:

```css
/* src/theme/styles/global.css */
@import "tailwindcss";

@theme {
  --color-primary: #6366f1;
  --color-secondary: #ec4899;
  --font-family-display: "Inter", sans-serif;
}
```

> Tailwind v4 uses `@import "tailwindcss"` with the `@tailwindcss/vite` plugin. No `tailwind.config.js` needed.

### Adding React

```bash
pnpm astro add react
```

```tsx
// src/theme/components/Counter.tsx
import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>;
}
```

```astro
---
import Counter from "@kapi/components/Counter.tsx";
---
<Counter client:load />
```

### Adding Vue

```bash
pnpm astro add vue
```

### Adding Svelte

```bash
pnpm astro add svelte
```

### Adding Preact

```bash
pnpm astro add preact
```

### Client Directives Reference

| Directive | When it hydrates | Best for |
|-----------|-----------------|----------|
| `client:load` | Immediately on page load | Critical interactive elements |
| `client:idle` | When browser is idle | Non-critical widgets |
| `client:visible` | When element enters viewport | Below-the-fold content |
| `client:media={condition}` | When media query matches | Responsive components |
| `client:only="react"` | Client-side only, skip SSR | Components using `window` |

---

## 10. Plugins

Plugins add optional functionality — shortcodes, widget types, CSS variable sets — without modifying core files.

### Enable built-in plugins

```env
PUBLIC_KAPI_PLUGINS=kapilabs-plugin-seo,kapilabs-plugin-forms,kapilabs-plugin-blog,kapilabs-plugin-testimonials
```

| Plugin key | What it adds |
|------------|-------------|
| `kapilabs-plugin-seo` | Enhanced JSON-LD schema injection |
| `kapilabs-plugin-forms` | Additional form field types and hooks |
| `kapilabs-plugin-blog` | Reading time, related posts, `[kapi_posts]` shortcode |
| `kapilabs-plugin-testimonials` | `[kapi_testimonials_plugin]` shortcode |
| `kapilabs-plugin-gallery` | Example plugin — image gallery shortcode |

### Build your own plugin

```bash
pnpm kapi generate plugin my-plugin
```

Scaffolds `plugins/my-plugin/index.ts` using `@kapilabs/plugin-sdk`:

```typescript
import { definePlugin } from "@kapilabs/plugin-sdk";

export default definePlugin({
  name: "kapilabs-plugin-my-plugin",
  register(ctx) {
    ctx.registerShortcode("kapi_my_shortcode", (attrs) => {
      return `<div class="my-shortcode">${attrs.text || ""}</div>`;
    });
    ctx.registerCssVars({ "--my-color": "#6366f1" });
  },
});
```

Then add your plugin to `src/core/plugins/loader.ts` and enable it via `PUBLIC_KAPI_PLUGINS`.

### Marketplace plugins

```bash
pnpm kapi install <package-name>
pnpm kapi search gallery
pnpm kapi list plugins
```

---

## 11. Optional Features

All optional features are disabled by default and activated by setting environment variables.

### Form email notifications (SMTP)

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

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → **Turnstile** → **Add site**
2. Copy the Site Key and Secret Key

```env
PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAAAxxx
TURNSTILE_SECRET_KEY=0x4AAAAAAAxxx
```

When both keys are set, Turnstile activates automatically on all forms.

### Store form submissions in Sanity

```env
FORM_STORAGE_BACKEND=sanity
```

Requires `SANITY_TOKEN` with Editor permissions.

### CORS for API routes

```env
PUBLIC_KAPI_CORS=https://your-frontend.com,https://staging.your-frontend.com
```

---

## 12. Other CMS Backends

```env
PUBLIC_CMS_BACKEND=wordpress  # or contentful | emdash | sanity
```

### WordPress (headless)

```env
PUBLIC_CMS_BACKEND=wordpress
WORDPRESS_API_URL=https://yourdomain.com/wp-json/wp/v2
```

No additional plugins needed. Uses the WordPress REST API directly.

### Contentful

```env
PUBLIC_CMS_BACKEND=contentful
CONTENTFUL_SPACE_ID=your-space-id
CONTENTFUL_ACCESS_TOKEN=your-delivery-api-key
CONTENTFUL_ENVIRONMENT=master
```

### EmDash

```env
PUBLIC_CMS_BACKEND=emdash
EMDASH_API_URL=https://your-emdash-instance.com/api
```

### Feature comparison

| Feature | Sanity | WordPress | Contentful | EmDash |
|---------|--------|-----------|------------|--------|
| Pages, Posts, Menus | ✅ | ✅ | ✅ | ✅ |
| Advanced search | ✅ | Stub | Stub | Stub |
| Saved sections | ✅ | — | ✅ | ✅ |

Sanity is the most complete backend. All others are functional for core content.

---

## 13. Cloudflare Deployment

Pre-configured for Cloudflare Pages with D1, R2, and KV bindings.

### Architecture

| Service | Binding | Purpose |
|---------|---------|---------|
| **D1** (SQLite) | `DB` | Form submissions, structured data |
| **R2** (object storage) | `BUCKET` | Images, PDFs, file uploads |
| **KV** (key-value) | `KV` | Sessions, cache, feature flags |

### Prerequisites

- [Cloudflare account](https://dash.cloudflare.com) (free tier works)
- `wrangler` CLI: `npm install -g wrangler`

### Step 1 — Create Cloudflare resources

```bash
# Create D1 database — copy the database_id from output
npx wrangler d1 create kapilabs-db

# Create R2 bucket
npx wrangler r2 bucket create kapilabs-assets

# Create KV namespace — copy the id from output
npx wrangler kv namespace create kapilabs-sessions
```

### Step 2 — Update `wrangler.toml`

Replace the placeholder IDs with the actual ones from Step 1:

```toml
[[d1_databases]]
binding = "DB"
database_name = "kapilabs-db"
database_id = "<paste-database-id-here>"

[[kv_namespaces]]
binding = "KV"
id = "<paste-namespace-id-here>"
```

### Step 3 — Deploy

```bash
pnpm build
npx wrangler pages deploy dist/ --branch main
```

**Or connect GitHub for automatic deploys:**

1. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. Select your repository
3. Build command: `pnpm build` | Output directory: `dist/`
4. Add environment variables: `PUBLIC_SANITY_PROJECT_ID`, `SANITY_TOKEN`, `FORM_ADMIN_KEY`, etc.
5. Add bindings: `DB` (D1), `BUCKET` (R2), `KV` (KV namespace)

### Local dev with Cloudflare bindings

```bash
npx wrangler pages dev -- pnpm dev
```

### Important notes

- Environment variables must be set in the Cloudflare dashboard — `.env` files are not read in production
- Bindings must be added in both `wrangler.toml` (local) and the Cloudflare dashboard (production)
- `output: "server"` is required — do not change to `"static"` (disables all API routes)

---

## 14. Development Commands & CLI

### Standard commands

```bash
pnpm dev          # Start dev server at http://localhost:4321
pnpm build        # Production build (output in dist/)
pnpm preview      # Serve the production build locally
pnpm typecheck    # TypeScript + Astro type check (expects 0 errors)
pnpm qa           # typecheck + build (pre-deploy check)
pnpm seed         # Seed Sanity with starter content
```

**Sanity Studio (run from `studio/` folder):**
```bash
cd studio
npx sanity dev      # Studio at http://localhost:3333
npx sanity deploy   # Deploy Studio to sanity.studio
```

**Dry run seed (no credentials needed):**
```bash
node scripts/seed-sanity.mjs --dry-run
```

### KapiLabs CLI (`pnpm kapi`)

```bash
pnpm kapi help                             # Show all commands

# Generators
pnpm kapi generate child-theme <name>      # Scaffold a child theme in src/theme/
pnpm kapi generate plugin <name>           # Scaffold a new plugin in plugins/<name>/

# Marketplace
pnpm kapi install <package>                # Install a marketplace package
pnpm kapi search [query]                   # Search the marketplace
pnpm kapi list [type]                      # List packages by type

# Theme
pnpm kapi import-theme <file.json>                  # Validate and apply a theme export
pnpm kapi import-theme <file.json> --mode=replace   # Overwrite all settings
```

---

## 15. All Routes

### Public routes

| Route | Description |
|-------|-------------|
| `/` | Homepage |
| `/[...slug]` | Any CMS page by slug |
| `/blog` | Blog archive |
| `/blog/[slug]` | Single blog post |
| `/category/[slug]` | Posts by category |
| `/tag/[slug]` | Posts by tag |
| `/search` | Faceted search (type, category, tag, date, pagination) |
| `/team` | Team member listing |
| `/team/[slug]` | Single team member profile |
| `/sitemap.xml` | Auto-generated sitemap |
| `/robots.txt` | Auto-generated robots file |

### API routes

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/health` | GET | None | `{"ok":true}` — uptime monitoring |
| `/api/forms/submit` | POST | CSRF token | Submit a form (rate limited) |
| `/api/forms/export` | GET | `x-admin-key` header | Download submissions as CSV |

### Admin routes (require `FORM_ADMIN_KEY`)

| Route | Description |
|-------|-------------|
| `/admin/submissions` | View and search all form submissions |
| `/admin/theme` | Export / import theme settings |
| `/admin/plugins` | Browse marketplace plugins |

---

## 16. Deployment (Alternative — VPS / Docker)

```bash
pnpm build
node ./dist/server/entry.mjs
```

Set all `.env` variables as real environment variables in your server environment before starting.

**Docker:**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY dist/ ./dist/
COPY package.json ./
RUN npm install --only=production
EXPOSE 4321
CMD ["node", "./dist/server/entry.mjs"]
```

**PM2:**
```bash
pnpm build
pm2 start ./dist/server/entry.mjs --name kapilabs --env production
pm2 save
pm2 startup
```

> HTTPS is required for `Secure` cookies (admin session and CSRF tokens). Put nginx or Caddy in front for HTTPS.

---

## 17. Project Structure

```
kapilabs-starter/
├── src/
│   ├── pages/                    # Astro routes
│   │   ├── index.astro           # Homepage
│   │   ├── [...slug].astro       # Dynamic CMS pages
│   │   ├── blog/                 # Blog routes
│   │   ├── admin/                # Admin panel
│   │   └── api/                  # API endpoints
│   │
│   ├── core/                     # Framework — do not edit
│   │   ├── cms/                  # CMS adapters + types
│   │   │   ├── sanity/           # Sanity adapter
│   │   │   ├── wordpress.ts
│   │   │   ├── contentful.ts
│   │   │   ├── emdash.ts
│   │   │   └── types.ts
│   │   ├── components/           # Header, Footer, CmsImage, etc.
│   │   ├── forms/                # CSRF, validation, rate limiting, storage
│   │   ├── layouts/              # BaseLayout, SiteLayout, 7 layout variants
│   │   ├── plugins/              # Plugin registry + loader
│   │   ├── sections/             # 12 page section types
│   │   ├── seo/                  # SeoHead, JSON-LD schema builders
│   │   ├── shortcodes/           # 11 built-in shortcodes
│   │   └── theme/                # ThemeVariables, widget areas
│   │
│   ├── plugins/                  # Built-in plugins
│   │   ├── seo/
│   │   ├── forms/
│   │   ├── blog/
│   │   └── testimonials/
│   │
│   └── theme/                    # YOUR CUSTOMIZATIONS — safe from updates
│       └── CUSTOMIZE.md          # Full list of overridable files
│
├── plugins/                      # Marketplace / custom plugins
│   └── example-gallery/          # Reference plugin implementation
│
├── packages/
│   └── plugin-sdk/               # @kapilabs/plugin-sdk — build your own plugins
│
├── studio/                       # Sanity Studio
│   ├── schemaTypes/              # Content type definitions (pre-wired)
│   └── sanity.config.ts
│
├── starter-content/              # Seed data for Sanity
│   ├── guide.html                # Setup guide (open in browser)
│   ├── pages/
│   ├── posts/
│   └── starter.config.json
│
├── scripts/
│   ├── seed-sanity.mjs           # pnpm seed
│   ├── kapi.mjs                  # pnpm kapi CLI
│   ├── setup-kapilabs-project.ps1
│   └── setup-kapilabs-project.sh
│
├── .env.example                  # Copy to .env and fill in
├── astro.config.mjs
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── tsconfig.json
└── wrangler.toml                 # Cloudflare bindings config
```

---

## 18. Troubleshooting

### Pages are empty or show "Connect a CMS"

- Check `PUBLIC_SANITY_PROJECT_ID` is correct in `.env`
- Check `pnpm seed` completed without errors
- Check `http://localhost:4321` is in CORS origins at sanity.io/manage
- Restart the dev server after changing `.env`

### `pnpm install` fails

- Confirm pnpm version 8+: `pnpm -v`
- Try: `pnpm install --no-frozen-lockfile`
- Delete `node_modules/` and `pnpm-lock.yaml`, then `pnpm install`

### Sanity Studio shows "Schema errors"

- Both `.env` files must be filled in (project root and `studio/`)
- Project IDs must match exactly
- Run `npx sanity manage` in `studio/` to check project status

### Form submissions not being saved

- Check `FORM_ADMIN_KEY` is set
- If `FORM_STORAGE_BACKEND=sanity`, ensure `SANITY_TOKEN` has Editor permissions
- For JSON storage, file is at `data/form-submissions.json` (auto-created)

### Admin login says "Invalid admin key"

- Key must exactly match `FORM_ADMIN_KEY` in `.env`
- Restart dev server after changing `.env`
- Session expires after 15 minutes — log in again if idle

### TypeScript errors on `pnpm typecheck`

- Run `pnpm install` after any changes to `package.json`
- Fix all errors before running `pnpm build`

### Build fails with "Cannot find module"

- Run `pnpm install` first
- Check `packages/` is listed in `pnpm-workspace.yaml`
- If you added a new plugin, add it to `src/core/plugins/loader.ts`

### Theme override warning: "has no matching core file"

```
⚠ [KapiLabs] Theme override has no matching core file: src/theme/sections/X.astro
```

A file in `src/theme/` has no corresponding file in `src/core/`. Either create the matching core file or remove the theme override.

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
- Off-canvas drawer menu with focus trap and ESC close
- 20 widget areas, 13 menu locations

### Forms
- CSRF token protection on all endpoints
- Zod schema validation + `sanitize-html` XSS stripping
- Rate limiting (10 submissions/min per IP)
- Optional Cloudflare Turnstile bot protection
- Storage backends: JSON file or Sanity
- SMTP email notifications
- Admin CSV export

### SEO
- `<SeoHead>` — title, description, canonical, OG tags, Twitter Cards
- JSON-LD structured data — Organization, WebSite, Article, FAQPage, HowTo, Person, BreadcrumbList
- Auto-generated `/robots.txt` and `/sitemap.xml`

### Security
- CSRF protection on all forms
- HMAC-SHA256 signed admin session tokens (15-minute expiry)
- Rate limiting on form submissions and login attempts
- Security headers: CSP, HSTS, X-Frame-Options, Permissions-Policy, Referrer-Policy
- `HttpOnly + Secure + SameSite=Strict` cookies

### Plugin system
- 4 built-in plugins: seo, forms, blog, testimonials
- Plugin SDK (`@kapilabs/plugin-sdk`) — register shortcodes, CSS variables, widget areas
- CLI scaffolding: `pnpm kapi generate plugin <name>`
- Marketplace: `pnpm kapi install <package>`

### Performance
- Astro SSR + islands architecture — minimal JavaScript sent to browser
- Shared chunk splitting for Sanity client and vendor libraries
- LQIP (Low Quality Image Placeholder) for Sanity images
- Focal point cropping for CMS images

### Accessibility
- Skip-to-content link on every page
- ARIA landmarks, `aria-current` on breadcrumbs and active nav links
- Focus trap and ESC close on off-canvas menu
- All CSS animations respect `prefers-reduced-motion`

---

## License

See [LICENSE](./LICENSE).
