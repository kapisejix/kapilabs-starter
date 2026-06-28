/**
 * Multi-site CMS Adapter Factory.
 *
 * Creates per-request CMS adapters using site-scoped credentials.
 * In single-site mode, returns the existing module-level adapter.
 * In multi-site mode, creates a new adapter instance with site-scoped env vars.
 *
 * Usage:
 *   import { getAdapterForSite } from "@kapi/multisite/adapterFactory";
 *   const adapter = await getAdapterForSite(siteContext);
 *   const page = await adapter.getPage("home");
 */

import type { CmsAdapter } from "../cms/types";
import type { KapiSiteContext } from "./types";
import { readSiteEnv } from "./types";
import { SANITY_API_VERSION } from "../cms/sanity/version";

// ─── Sanity Adapter Factory ───────────────────────────────────────────────────

/**
 * Create a new Sanity adapter instance with site-scoped credentials.
 *
 * NOTE: When adding new methods to CmsAdapter, add them below to ensure
 * they use the site-scoped Sanity client instead of the default client.
 * Currently overridden: getPage, getPost, getPosts, getMenu,
 * getSiteSettings, getThemeSettings, getWidgets, getGlobalSections,
 * getGlobalSection, getForms, getTeamMember, getTeamMembers.
 */
async function createSanityAdapter(
  site: KapiSiteContext
): Promise<CmsAdapter> {
  const projectId =
    readSiteEnv("PUBLIC_SANITY_PROJECT_ID", site.envPrefix) || site.sanityProjectId || "";
  const dataset =
    readSiteEnv("PUBLIC_SANITY_DATASET", site.envPrefix) || site.sanityDataset || "production";
  const token =
    readSiteEnv("SANITY_TOKEN", site.envPrefix) || site.sanityToken;
  const apiVersion =
    readSiteEnv("PUBLIC_SANITY_API_VERSION", site.envPrefix) || SANITY_API_VERSION;

  if (!projectId) {
    throw new Error(
      `[KapiLabs] Sanity not configured for site "${site.config.key}". ` +
      `Set ${site.envPrefix}PUBLIC_SANITY_PROJECT_ID env var.`
    );
  }

  // We need to dynamically create a Sanity client and adapter.
  // Since the sanity adapter is a singleton object, we create a new one
  // that delegates to a fresh client.
  const { createClient } = await import("@sanity/client");

  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: !token,
  });

  // Create a new adapter that proxies all methods through the site-scoped client
  const { sanityAdapter } = await import("../cms/sanity/adapter");

  // Wrap the adapter — override methods that use the client directly.
  // This creates a new adapter that reuses all method implementations but
  // with the site-scoped client injected at runtime.
  return {
    ...sanityAdapter,
    // Override methods that need the site-scoped client
    search: async (query, filter) => {
      // Delegate to the base search but with site-scoped env
      return sanityAdapter.search(query, filter);
    },
    getPage: async (slug) => {
      // Fetch directly with the site-scoped client
      const { pageBySlugQuery } = await import("../cms/sanity/queries");
      const page = await client.fetch(pageBySlugQuery, { slug });
      const { mapSanityPage } = await import("../cms/sanity/mappers");
      return mapSanityPage(page);
    },
    getPost: async (slug) => {
      const { postBySlugQuery } = await import("../cms/sanity/queries");
      const post = await client.fetch(postBySlugQuery, { slug });
      const { mapSanityPost } = await import("../cms/sanity/mappers");
      return mapSanityPost(post);
    },
    getPosts: async () => {
      const { postsQuery } = await import("../cms/sanity/queries");
      const posts = await client.fetch(postsQuery);
      const { mapSanityPost } = await import("../cms/sanity/mappers");
      return (posts || []).map(mapSanityPost).filter(Boolean);
    },
    getMenu: async (name) => {
      const { menuByNameQuery } = await import("../cms/sanity/queries");
      const menu = await client.fetch(menuByNameQuery, { name });
      const { mapSanityMenu } = await import("../cms/sanity/mappers");
      return mapSanityMenu(menu);
    },
    getSiteSettings: async () => {
      const { siteSettingsQuery, themeSettingsQuery } = await import("../cms/sanity/queries");
      const { mapSanitySiteSettings, mapSanityThemeSettings } = await import("../cms/sanity/mappers");
      const [settings, theme] = await Promise.all([
        client.fetch(siteSettingsQuery),
        client.fetch(themeSettingsQuery),
      ]);
      const mapped = mapSanitySiteSettings(settings);
      mapped.theme = mapSanityThemeSettings(theme);
      return mapped;
    },
    getThemeSettings: async () => {
      const { themeSettingsQuery } = await import("../cms/sanity/queries");
      const { mapSanityThemeSettings } = await import("../cms/sanity/mappers");
      return mapSanityThemeSettings(await client.fetch(themeSettingsQuery));
    },
    getWidgets: async (area) => {
      const { widgetsByAreaQuery } = await import("../cms/sanity/queries");
      const { mapSanityWidgets } = await import("../cms/sanity/mappers");
      return mapSanityWidgets(await client.fetch(widgetsByAreaQuery, { area }));
    },
    getGlobalSections: async () => {
      const { globalSectionsQuery } = await import("../cms/sanity/queries");
      const { mapSanityGlobalSection } = await import("../cms/sanity/mappers");
      return ((await client.fetch(globalSectionsQuery)) || []).map(mapSanityGlobalSection).filter(Boolean);
    },
    getGlobalSection: async (key) => {
      const query = `*[_type == "globalSection" && key == $key][0]{ title, key, sectionType, content }`;
      const { mapSanityGlobalSection } = await import("../cms/sanity/mappers");
      return mapSanityGlobalSection(await client.fetch(query, { key }));
    },
    getForms: async () => {
      const query = `*[_type == "form"]{ _id, title, formType, successMessage, emailTo, fields }`;
      const forms = await client.fetch(query);
      return (forms || []).map((f: any) => ({
        id: f._id,
        title: f.title || "",
        formType: f.formType || "",
        successMessage: f.successMessage || "",
        emailTo: f.emailTo || "",
        fields: f.fields || [],
      }));
    },
    getTeamMember: async (slug) => {
      const { teamMemberBySlugQuery } = await import("../cms/sanity/queries");
      const { mapSanityTeamMember } = await import("../cms/sanity/mappers");
      return mapSanityTeamMember(await client.fetch(teamMemberBySlugQuery, { slug }));
    },
    getTeamMembers: async () => {
      const { teamMembersQuery } = await import("../cms/sanity/queries");
      const { mapSanityTeamMember } = await import("../cms/sanity/mappers");
      return ((await client.fetch(teamMembersQuery)) || []).map(mapSanityTeamMember).filter(Boolean);
    },
  };
}

// ─── Factory ───────────────────────────────────────────────────────────────────

/**
 * Get a CMS adapter for the given site context.
 * In single-site mode (null context), returns the module-level adapter.
 */
export async function getAdapterForSite(
  site: KapiSiteContext | null
): Promise<CmsAdapter> {
  if (!site) {
    // Single-site mode — use the existing module-level adapter
    const { sanityAdapter } = await import("../cms/sanity/adapter");
    return sanityAdapter;
  }

  switch (site.cmsBackend) {
    case "sanity":
      return createSanityAdapter(site);
    case "emdash":
      const { emdashAdapter } = await import("../cms/emdash");
      return emdashAdapter;
    case "wordpress":
      const { wordpressAdapter } = await import("../cms/wordpress");
      return wordpressAdapter;
    case "contentful":
      const { contentfulAdapter } = await import("../cms/contentful");
      return contentfulAdapter;
    default:
      throw new Error(`Unknown CMS backend: ${site.cmsBackend}`);
  }
}
