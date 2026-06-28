import type { CmsAdapter } from "./types";
import type { APIContext, AstroGlobal } from "astro";

import { sanityAdapter } from "./sanity";
import { emdashAdapter } from "./emdash";
import { wordpressAdapter } from "./wordpress";
import { contentfulAdapter } from "./contentful";

const cms = import.meta.env.PUBLIC_CMS_BACKEND || "sanity";

const adapters: Record<string, CmsAdapter> = {
  sanity: sanityAdapter,
  emdash: emdashAdapter,
  wordpress: wordpressAdapter,
  contentful: contentfulAdapter,
};

const adapter = adapters[cms];

if (!adapter) {
  throw new Error(`Invalid CMS backend: ${cms}`);
}

export const getPage = adapter.getPage;
export const getPosts = adapter.getPosts;
export const getPost = adapter.getPost;
export const getMenu = adapter.getMenu;
export const getSiteSettings = adapter.getSiteSettings;
export const getThemeSettings = adapter.getThemeSettings;
export const getWidgets = adapter.getWidgets;
export const getGlobalSections = adapter.getGlobalSections;
export const getGlobalSection = adapter.getGlobalSection;

export type {
  NormalizedPage,
  NormalizedPost,
  NormalizedMenu,
  NormalizedSiteSettings,
  NormalizedThemeSettings,
  NormalizedWidget,
  NormalizedSection,
  NormalizedGlobalSection,
  RichContent,
  RichContentBlock,
  CmsImage,
} from "./types";


export const search = adapter.search;

export const getRelatedContent = adapter.getRelatedContent;

export const getTeamMember = adapter.getTeamMember;
export const getTeamMembers = adapter.getTeamMembers;
export const getPostsByTeamMember = adapter.getPostsByTeamMember;

export const getForms = adapter.getForms;
export const getTaxonomies = adapter.getTaxonomies;
export const getSavedSection = adapter.getSavedSection;
export const getSavedSections = adapter.getSavedSections;

export const searchAdvanced = adapter.searchAdvanced;

export const getKnowledgeBaseCategories = adapter.getKnowledgeBaseCategories;
export const getKnowledgeBaseArticles = adapter.getKnowledgeBaseArticles;
export const getKnowledgeBaseArticle = adapter.getKnowledgeBaseArticle;
export const getKnowledgeBaseTree = adapter.getKnowledgeBaseTree;

export const getNewsletterConfig = adapter.getNewsletterConfig;

/**
 * Returns the CMS adapter scoped to the current request's site.
 * In single-site mode, returns the module-level singleton.
 * In multi-site mode, returns a per-site adapter using site-scoped credentials.
 *
 * Usage in Astro pages/layouts:
 *   const cms = await getCmsAdapter(Astro);
 *   const page = await cms.getPage(slug);
 */
export async function getCmsAdapter(
  astro: APIContext | AstroGlobal
): Promise<CmsAdapter> {
  const site = astro.locals?.site;
  if (!site) return adapter;
  const { getAdapterForSite } = await import("../multisite/adapterFactory");
  return getAdapterForSite(site);
}
