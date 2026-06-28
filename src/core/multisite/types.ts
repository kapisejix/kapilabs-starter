/**
 * Multi-site Foundation — types and configuration schema.
 *
 * Enables a single KapiLabs codebase to serve multiple client sites,
 * each with its own CMS backend, theme settings, and content.
 *
 * Usage:
 *   ```ts
 *   // kapilabs.config.ts
 *   export default {
 *     sites: [
 *       {
 *         name: "Client A",
 *         key: "client-a",
 *         hostnames: ["clienta.com", "www.clienta.com"],
 *         cms: {
 *           backend: "sanity",
 *           envPrefix: "CLIENT_A_",
 *         },
 *         theme: "client-a",
 *       },
 *     ],
 *   };
 *   ```
 */

/**
 * CMS configuration per site.
 */
export type SiteCmsConfig = {
  /** CMS backend — sanity, emdash, wordpress, contentful */
  backend: string;
  /**
   * Environment variable prefix for site-scoped credentials.
   * E.g., "CLIENT_A_" means the adapter reads SANITY_PROJECT_ID from
   * CLIENT_A_SANITY_PROJECT_ID.
   */
  envPrefix: string;
  /** Optional direct credentials (not recommended — use env vars + prefix) */
  credentials?: Record<string, string>;
};

/**
 * Theme configuration per site.
 */
export type SiteThemeConfig = {
  /** Theme name — maps to src/themes/<name>/ directory */
  name: string;
  /** Optional parent theme to inherit from */
  extends?: string;
  /** Theme settings overrides */
  settings?: Record<string, unknown>;
};

/**
 * Single site configuration.
 */
export type KapiSiteConfig = {
  /** Display name */
  name: string;
  /** Unique site key (used for routing internally) */
  key: string;
  /** Hostnames this site responds to */
  hostnames: string[];
  /** Default hostname (used for canonical links) */
  defaultHostname?: string;
  /** CMS configuration */
  cms: SiteCmsConfig;
  /** Theme configuration */
  theme?: SiteThemeConfig;
  /** Site-specific plugins to enable */
  plugins?: string[];
  /** Active features for this site */
  features?: string[];
  /** Custom site metadata */
  metadata?: Record<string, unknown>;
};

/**
 * Full multi-site configuration.
 */
export type KapiMultiSiteConfig = {
  /** List of configured sites */
  sites: KapiSiteConfig[];
  /** Default site key when no hostname matches */
  defaultSite?: string;
  /** Enable multi-site mode */
  enabled: boolean;
};

/**
 * Runtime site context — available per-request after middleware resolves.
 */
export type KapiSiteContext = {
  /** Resolved site configuration */
  config: KapiSiteConfig;
  /** The matched hostname */
  hostname: string;
  /** Site-specific env var prefix */
  envPrefix: string;
  /** Sanity project ID (resolved from env) */
  sanityProjectId?: string;
  /** Sanity dataset (resolved from env) */
  sanityDataset?: string;
  /** Sanity API token (resolved from env, server-only) */
  sanityToken?: string;
  /** CMS backend type */
  cmsBackend: string;
};

/**
 * Built-in sites configuration (for when no kapilabs.config.ts exists).
 */
export const DEFAULT_SINGLE_SITE_CONFIG: KapiMultiSiteConfig = {
  enabled: false,
  sites: [
    {
      name: "Default",
      key: "default",
      hostnames: ["*"],
      cms: {
        backend: "sanity",
        envPrefix: "",
      },
    },
  ],
  defaultSite: "default",
};

/**
 * Resolve a site-scoped environment variable name.
 * E.g., resolveEnvName("SANITY_PROJECT_ID", "CLIENT_A_") => "CLIENT_A_SANITY_PROJECT_ID"
 */
export function resolveEnvName(name: string, prefix: string): string {
  if (!prefix) return name;
  return `${prefix}${name}`;
}

/**
 * Read a site-scoped environment variable.
 */
export function readSiteEnv(
  name: string,
  prefix: string
): string | undefined {
  const envName = resolveEnvName(name, prefix);
  return (
    (typeof process !== "undefined"
      ? process.env[envName]
      : undefined) ||
    (typeof import.meta !== "undefined"
      ? (import.meta as Record<string, any>).env?.[envName]
      : undefined)
  );
}
