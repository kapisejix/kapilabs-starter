/**
 * Site registry — loads multi-site config, matches hostnames, and resolves
 * per-request site context.
 *
 * In single-site mode (default), this module returns a no-op context.
 * In multi-site mode, it reads kapilabs.config.ts and resolves
 * site context from the incoming request hostname.
 */

import type {
  KapiMultiSiteConfig,
  KapiSiteConfig,
  KapiSiteContext,
} from "./types";
import { DEFAULT_SINGLE_SITE_CONFIG, readSiteEnv } from "./types";

// ─── Config Loading ───────────────────────────────────────────────────────────

let _configPromise: Promise<KapiMultiSiteConfig> | null = null;

/**
 * Load the multi-site configuration.
 * First tries to read process.env/MODULE config, then falls back to defaults.
 */
export async function loadConfig(): Promise<KapiMultiSiteConfig> {
  if (_configPromise) return _configPromise;

  _configPromise = (async (): Promise<KapiMultiSiteConfig> => {
    try {
      // Read multi-site config from env vars as a fallback-safe mechanism
      // that works in both dev and production.
      const sitesJson = typeof process !== "undefined"
        ? process.env.KAPI_MULTISITE_SITES
        : undefined;

      if (sitesJson) {
        try {
          const parsed = JSON.parse(sitesJson);
          return {
            enabled: true,
            sites: Array.isArray(parsed) ? parsed : parsed.sites || [],
            defaultSite: parsed.defaultSite,
          };
        } catch {
          // Invalid JSON, fall through
        }
      }

      return DEFAULT_SINGLE_SITE_CONFIG;
    } catch {
      return DEFAULT_SINGLE_SITE_CONFIG;
    }
  })();

  return _configPromise;
}

/**
 * Manually set the multi-site configuration (used in tests or programmatic setup).
 */
export function setConfig(config: KapiMultiSiteConfig): void {
  _configPromise = Promise.resolve(config);
}

/**
 * Reset the configuration (for testing).
 */
export function resetConfig(): void {
  _configPromise = null;
}

// ─── Hostname Matching ────────────────────────────────────────────────────────

/**
 * Match a hostname against a site config's hostnames list.
 * Supports wildcard patterns: "*" matches anything, "*.example.com" matches subdomains.
 */
function matchHostname(hostname: string, patterns: string[]): boolean {
  const normalized = hostname.toLowerCase().replace(/:\d+$/, ""); // strip port

  return patterns.some((pattern) => {
    if (pattern === "*") return true;

    const normalizedPattern = pattern.toLowerCase();

    // Exact match
    if (normalized === normalizedPattern) return true;

    // Wildcard subdomain: *.example.com
    if (normalizedPattern.startsWith("*.")) {
      const domain = normalizedPattern.slice(2);
      return normalized.endsWith(domain) || normalized === domain;
    }

    return false;
  });
}

// ─── Site Resolution ──────────────────────────────────────────────────────────

/**
 * Resolve a site config by hostname.
 */
export async function resolveSiteByHostname(
  hostname: string
): Promise<KapiSiteConfig | null> {
  const config = await loadConfig();

  for (const site of config.sites) {
    if (matchHostname(hostname, site.hostnames)) {
      return site;
    }
  }

  // Fall back to default site
  if (config.defaultSite) {
    const defaultSite = config.sites.find(
      (s) => s.key === config.defaultSite
    );
    if (defaultSite) return defaultSite;
  }

  // Last resort: return first site
  return config.sites[0] || null;
}

/**
 * Build a full site context from a site config and hostname.
 */
export function buildSiteContext(
  config: KapiSiteConfig,
  hostname: string
): KapiSiteContext {
  const prefix = config.cms.envPrefix || "";

  return {
    config,
    hostname,
    envPrefix: prefix,
    sanityProjectId: readSiteEnv("PUBLIC_SANITY_PROJECT_ID", prefix),
    sanityDataset: readSiteEnv("PUBLIC_SANITY_DATASET", prefix) || "production",
    sanityToken: readSiteEnv("SANITY_TOKEN", prefix),
    cmsBackend: config.cms.backend,
  };
}

/**
 * Resolve a full site context from a hostname.
 */
export async function resolveSiteContext(
  hostname: string
): Promise<KapiSiteContext | null> {
  const config = await resolveSiteByHostname(hostname);
  if (!config) return null;
  return buildSiteContext(config, hostname);
}

// ─── Site Listing ─────────────────────────────────────────────────────────────

/**
 * Get all configured sites.
 */
export async function getSites(): Promise<KapiSiteConfig[]> {
  const config = await loadConfig();
  return config.sites;
}

/**
 * Get whether multi-site mode is enabled.
 */
export async function isMultiSiteEnabled(): Promise<boolean> {
  const config = await loadConfig();
  return config.enabled && config.sites.length > 1;
}

/**
 * Get the count of configured sites.
 */
export async function getSiteCount(): Promise<number> {
  const config = await loadConfig();
  return config.sites.length;
}
