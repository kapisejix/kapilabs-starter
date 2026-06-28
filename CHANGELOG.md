# Changelog

## 1.0.0-rc.3

### Fixed

- **Critical: `src/pages/` was missing from setup script folder copy list** — The setup scripts (both `.ps1` and `.sh`) copied `src/core/`, `public/`, `studio/`, and other folders, but **not** `src/pages/`. This directory contains all 15 Astro route files (`index.astro`, `[...slug].astro`, `blog/*`, `team/*`, `category/*`, `tag/*`, `search/*`, `admin/*`, `api/*`, `404.astro`). Without routes, a freshly set up project had zero pages — every URL returned blank. Now added to both setup scripts.

- **Critical: Sanity `formSubmission` schema caused Studio SchemaError** — The `values` field was defined as `type: "object"` with an empty `fields: []`. Sanity v3 requires object types to have at least one field, causing the Studio to crash with a SchemaError on load. Changed to `type: "array"` of `{ key, value }` objects. Also updated the Sanity form storage adapter to convert between frontend object format (`Record<string, unknown>`) and the new array format, with backward compatibility for existing submissions.

- **`scripts/` directory was not copied to target project** — The `npm run seed` command (`node scripts/seed-sanity.mjs`) failed after the temp clone was deleted because `scripts/` wasn't part of the setup's folder copy list. Now added to both setup scripts so the seed script lives permanently in the project.

- **`-Seed` flag documentation referenced deleted temp folder** — The README showed a separate `-Seed` command referencing `kapilabs-temp` that would fail after cleanup. Restructured docs to show the simpler post-setup flow (`npm run seed` from project directory) first, with the combined setup + seed command as a callout with explanation.

- **Cleaned up `.env.example` and `studio/.env.example`** — Removed stray `[TEMPLATE]` artifact lines.

---

## 1.0.0-rc.2

### Fixed

- **Critical: Frontend Sanity client now includes read token** — The `src/core/cms/sanity/client.ts` was missing the `SANITY_TOKEN` parameter, which prevented the frontend from querying private Sanity datasets. New Sanity projects create private datasets by default, so all GROQ queries returned empty results. The token is now passed through, enabling the frontend to read content from private datasets.

- **Cleaned up `.env.example` and `studio/.env.example`** — Removed the stray `[TEMPLATE]` artifact lines that were copied into `.env` files during setup.

---

## 1.0.0-rc.1

### Added

- CMS Adapter Architecture
- Sanity CMS Integration
- Team Member Author System
- WordPress-style Menu Architecture
- Forms System
- SEO Framework
- Related Content System
- Search System
- Theme Settings
- Design Tokens
- Production QA Audit

### Documentation

- README.md
- docs/CMS_ADAPTER_GUIDE.md
- docs/SANITY_SETUP.md
- docs/PRODUCTION_QA_AUDIT.md
- docs/V1_RELEASE_ROADMAP.md
- docs/RELEASE_CHECKLIST.md
