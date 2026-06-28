/**
 * Site context utility for Astro components.
 *
 * Provides typed access to the current site context (resolved by middleware)
 * and site-scoped CMS data helpers.
 *
 * Usage in Astro pages:
 *   import { getSiteContext } from "@kapi/multisite/context";
 *   const site = getSiteContext(Astro);
 */

import type { APIContext, AstroGlobal } from "astro";
import type { KapiSiteContext } from "./types";
import { readSiteEnv } from "./types";

/**
 * Get the current site context from Astro's locals.
 * In single-site mode, returns null (existing code continues to work).
 */
export function getSiteContext(
  astro: APIContext | AstroGlobal
): KapiSiteContext | null {
  const locals = (astro as any).locals;
  if (!locals) return null;
  return locals.site as KapiSiteContext | null;
}

/**
 * Get the site key from the current context.
 */
export function getSiteKey(astro: APIContext | AstroGlobal): string {
  return getSiteContext(astro)?.config?.key || "default";
}

/**
 * Get site-scoped environment variables for the current request.
 */
export function getSiteEnv(
  astro: APIContext | AstroGlobal,
  name: string
): string | undefined {
  const site = getSiteContext(astro);
  if (!site) {
    return (
      (typeof process !== "undefined"
        ? process.env[name]
        : undefined) ||
      (typeof import.meta !== "undefined"
        ? (import.meta as Record<string, any>).env?.[name]
        : undefined)
    );
  }

  return readSiteEnv(name, site.envPrefix);
}

/**
 * Build a site-scoped Sanity client config.
 * Returns null in single-site mode (existing client continues to work).
 */
export function getSiteSanityConfig(astro: APIContext | AstroGlobal): {
  projectId: string;
  dataset: string;
  token?: string;
} | null {
  const site = getSiteContext(astro);
  if (!site) return null;

  const projectId =
    site.sanityProjectId ||
    getSiteEnv(astro, "PUBLIC_SANITY_PROJECT_ID") ||
    "";
  const dataset =
    site.sanityDataset ||
    getSiteEnv(astro, "PUBLIC_SANITY_DATASET") ||
    "production";
  const token =
    site.sanityToken || getSiteEnv(astro, "SANITY_TOKEN");

  if (!projectId) return null;

  return { projectId, dataset, token };
}
