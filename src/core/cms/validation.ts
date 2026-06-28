/**
 * Zod validation schemas for CMS boundary data.
 *
 * These schemas validate raw CMS responses at the adapter boundary before
 * they enter the mapper layer. This catches unexpected data shapes from
 * external CMS sources and provides type-safe output.
 *
 * Usage:
 *   const page = RawPageSchema.parse(rawData); // throws on invalid
 *   const safe = RawPageSchema.safeParse(rawData); // returns Result
 */

import { z } from "zod";

// ─── Image ───────────────────────────────────────────────────────────────

export const RawImageSchema = z.object({
  src: z.string().optional(),
  url: z.string().optional(),
  alt: z.string().optional().default(""),
  width: z.number().optional(),
  height: z.number().optional(),
  caption: z.string().optional(),
  credit: z.string().optional(),
  photographer: z.string().optional(),
  copyright: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  lqip: z.string().optional(),
  focalPoint: z
    .object({ x: z.number(), y: z.number() })
    .optional(),
}).passthrough();

// ─── SEO ─────────────────────────────────────────────────────────────────

export const RawSeoSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  canonicalUrl: z.string().optional(),
  noindex: z.boolean().optional(),
  nofollow: z.boolean().optional(),
  image: z.union([z.string(), z.record(z.unknown())]).optional(),
  ogType: z.string().optional(),
  twitterCard: z.string().optional(),
}).passthrough();

// ─── Page ────────────────────────────────────────────────────────────────

export const RawPageSchema = z.object({
  title: z.string().optional(),
  slug: z.string().optional(),
  template: z.string().optional(),
  layout: z.string().optional(),
  content: z.union([z.string(), z.array(z.unknown())]).optional(),
  sections: z.array(z.unknown()).optional(),
  featuredImage: z.union([RawImageSchema, z.null()]).optional(),
  seo: RawSeoSchema.optional(),
  customCode: z.record(z.unknown()).optional(),
}).passthrough();

// ─── Post ────────────────────────────────────────────────────────────────

export const RawPostSchema = z.object({
  title: z.string().optional(),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.union([z.string(), z.array(z.unknown())]).optional(),
  publishedAt: z.string().optional(),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  featuredImage: z.union([RawImageSchema, z.null()]).optional(),
  seo: RawSeoSchema.optional(),
}).passthrough();

// ─── Site Settings ───────────────────────────────────────────────────────

export const RawSiteSettingsSchema = z.object({
  siteTitle: z.string().optional(),
  tagline: z.string().optional(),
  locale: z.string().optional(),
  logo: z.union([RawImageSchema, z.null()]).optional(),
  favicon: z.union([RawImageSchema, z.null()]).optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
}).passthrough();

// ─── Theme Settings ──────────────────────────────────────────────────────

export const RawThemeSettingsSchema = z.object({
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  containerWidth: z.string().optional(),
  buttonStyle: z.string().optional(),
}).passthrough();

// ─── Team Member ─────────────────────────────────────────────────────────

export const RawTeamMemberSchema = z.object({
  name: z.string().optional(),
  slug: z.string().optional(),
  role: z.string().optional(),
  bio: z.string().optional(),
  email: z.string().optional(),
  website: z.string().optional(),
  linkedin: z.string().optional(),
  twitter: z.string().optional(),
  github: z.string().optional(),
  photo: z.union([RawImageSchema, z.null()]).optional(),
}).passthrough();

// ─── Menu ────────────────────────────────────────────────────────────────

export const RawMenuSchema = z.object({
  name: z.string().optional(),
  location: z.string().optional(),
  items: z.array(z.record(z.unknown())).optional(),
}).passthrough();

// ─── Widget ──────────────────────────────────────────────────────────────

export const RawWidgetSchema = z.object({
  id: z.string().optional(),
  area: z.string().optional(),
  type: z.string().optional(),
  title: z.string().optional(),
  content: z.unknown().optional(),
  menuName: z.string().optional(),
  buttonLabel: z.string().optional(),
  buttonUrl: z.string().optional(),
  order: z.number().optional(),
}).passthrough();

// ─── Form ────────────────────────────────────────────────────────────────

export const RawFormSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional(),
  formType: z.string().optional(),
  successMessage: z.string().optional(),
  emailTo: z.string().optional(),
  fields: z
    .array(
      z.object({
        name: z.string().optional(),
        label: z.string().optional(),
        type: z.string().optional(),
        placeholder: z.string().optional(),
        required: z.boolean().optional(),
        options: z.array(z.string()).optional(),
      }).passthrough()
    )
    .optional(),
}).passthrough();

// ─── Global Section ──────────────────────────────────────────────────────

export const RawGlobalSectionSchema = z.object({
  title: z.string().optional(),
  key: z.string().optional(),
  sectionType: z.string().optional(),
  content: z.record(z.unknown()).optional(),
}).passthrough();

// ─── Taxonomy ────────────────────────────────────────────────────────────

export const RawTaxonomySchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  slug: z.string().optional(),
  count: z.number().optional(),
  type: z.enum(["category", "tag"]).optional(),
}).passthrough();

// ─── Search Result ───────────────────────────────────────────────────────

export const RawSearchResultSchema = z.object({
  id: z.string().optional(),
  type: z.string().optional(),
  title: z.string().optional(),
  excerpt: z.string().optional(),
  slug: z.string().optional(),
  url: z.string().optional(),
  image: z.union([RawImageSchema, z.string()]).optional(),
}).passthrough();

// ─── Saved Section ───────────────────────────────────────────────────────

export const RawSavedSectionSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional(),
  slug: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  sectionType: z.string().optional(),
  content: z.record(z.unknown()).optional(),
  thumbnail: z.union([RawImageSchema, z.string()]).optional(),
  version: z.number().optional(),
  status: z.string().optional(),
}).passthrough();

// ─── Knowledge Base ──────────────────────────────────────────────────────

export const RawKbCategorySchema = z.object({
  id: z.string().optional(),
  title: z.string().optional(),
  slug: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  order: z.number().optional(),
  parentId: z.string().optional(),
  articleCount: z.number().optional(),
}).passthrough();

export const RawKbArticleSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional(),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  publishedAt: z.string().optional(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
}).passthrough();

// ─── Related Content ─────────────────────────────────────────────────────

export const RawRelatedContentSchema = z.object({
  id: z.string().optional(),
  type: z.string().optional(),
  title: z.string().optional(),
  excerpt: z.string().optional(),
  slug: z.string().optional(),
  url: z.string().optional(),
}).passthrough();
