import type {
  CmsAdapter,
  CmsImage,
  CmsThemeSettings,
  NormalizedMenu,
  NormalizedPage,
  NormalizedPost,
  NormalizedSection,
  NormalizedSiteSettings,
  NormalizedWidget,
} from "./types";
import type {
  RawContentfulAsset,
  RawContentfulEntry,
  RawContentfulPageFields,
  RawContentfulPostFields,
} from "./raw-types";

const CONTENTFUL_SPACE_ID = import.meta.env.CONTENTFUL_SPACE_ID || "";
const CONTENTFUL_ACCESS_TOKEN = import.meta.env.CONTENTFUL_ACCESS_TOKEN || "";
const CONTENTFUL_ENVIRONMENT = import.meta.env.CONTENTFUL_ENVIRONMENT || "master";

const CONTENTFUL_API_URL = `https://cdn.contentful.com/spaces/${CONTENTFUL_SPACE_ID}/environments/${CONTENTFUL_ENVIRONMENT}`;

async function contentfulFetch(path: string) {
  if (!CONTENTFUL_SPACE_ID || !CONTENTFUL_ACCESS_TOKEN) {
    console.warn("Contentful credentials are missing.");
    return null;
  }

  const res = await fetch(`${CONTENTFUL_API_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${CONTENTFUL_ACCESS_TOKEN}`,
    },
  });

  if (!res.ok) {
    console.warn(`Contentful fetch failed: ${path}`);
    return null;
  }

  return res.json();
}

function mapContentfulImage(asset: RawContentfulAsset | undefined | null): CmsImage | null {
  if (!asset?.fields?.file?.url) return null;
  const url = `https:${asset.fields.file.url}`;
  const details = asset.fields.file.details;

  const img: CmsImage = {
    src: url,
    alt: asset.fields.title || asset.fields.description || "",
    width: details?.image?.width,
    height: details?.image?.height,
    caption: asset.fields.description || "",
    credit: asset.fields.credit || "",
  };

  // LQIP: generate a tiny 20px-wide version using Contentful Images API.
  // The ?fm=webp&q=20 produces a highly compressed WebP.
  // Append params to the existing URL (remove any existing query string first).
  const baseUrl = url.split("?")[0];
  img.lqip = `${baseUrl}?w=20&fm=webp&q=20`;

  // Focal point: Contentful assets can store focus area data.
  // Check for focalPoint field directly on the asset fields.
  if (asset.fields.focalPoint) {
    img.focalPoint = {
      x: asset.fields.focalPoint.x,
      y: asset.fields.focalPoint.y,
    };
  }

  return img;
}

function resolveContentfulAsset(assetId: string, assets: RawContentfulAsset[]): CmsImage | null {
  if (!assetId || !Array.isArray(assets)) return null;
  const asset = assets.find((a: any) => a.sys?.id === assetId);
  return asset ? mapContentfulImage(asset) : null;
}

function mapContentfulSeo(entry: { fields?: any }, assets?: RawContentfulAsset[]) {
  const f = entry.fields || entry;
  return {
    title: f.seoTitle || f.title || "",
    description: f.seoDescription || f.excerpt || f.description || "",
    image: f.seoImage?.sys?.id
      ? resolveContentfulAsset(f.seoImage.sys.id, assets || [])?.src || ""
      : f.featuredImage?.sys?.id
        ? resolveContentfulAsset(f.featuredImage.sys.id, assets || [])?.src || ""
        : "",
    canonicalUrl: f.canonicalUrl || "",
    noindex: Boolean(f.noindex),
    nofollow: Boolean(f.nofollow),
  };
}

function mapContentfulPage(entry: RawContentfulEntry<RawContentfulPageFields> | undefined, assets?: RawContentfulAsset[]): NormalizedPage | null {
  if (!entry?.fields) return null;

  const fields = entry.fields;

  const featuredImage = fields.featuredImage?.sys?.id
    ? resolveContentfulAsset(fields.featuredImage.sys.id, assets || [])
    : null;

  return {
    title: fields.title || "",
    slug: fields.slug || "",
    template: fields.template || "default",
    layout: fields.layout || "content-sidebar",
    content: fields.content || "",
    sections: (fields.sections || []) as NormalizedSection[],
    featuredImage,
    seo: mapContentfulSeo(entry, assets),
  };
}

function mapContentfulPost(entry: RawContentfulEntry<RawContentfulPostFields> | undefined, assets?: RawContentfulAsset[]): NormalizedPost | null {
  if (!entry?.fields) return null;

  const fields = entry.fields;

  const featuredImage = fields.featuredImage?.sys?.id
    ? resolveContentfulAsset(fields.featuredImage.sys.id, assets || [])
    : null;

  return {
    title: fields.title || "",
    slug: fields.slug || "",
    excerpt: fields.excerpt || "",
    content: fields.content || "",
    publishedAt: fields.publishedAt || entry.sys?.createdAt,
    categories: fields.categories || [],
    tags: fields.tags || [],
    featuredImage,
    author: fields.author?.fields
      ? {
          name: fields.author.fields.name || "",
          slug: fields.author.fields.slug || "",
          role: fields.author.fields.role || "",
          bio: fields.author.fields.bio || "",
          photo: mapContentfulImage(fields.author.fields.photo),
        }
      : undefined,
    seo: mapContentfulSeo(entry, assets),
  };
}

export const contentfulAdapter: CmsAdapter = {
  async search(query, _filter?) {
    const data = await contentfulFetch(`/entries?query=${encodeURIComponent(query)}&limit=20`);
    if (!data?.items) return [];
    return (data.items as any[]).map((entry: any) => ({
      id: entry.sys?.id || "",
      type: entry.sys?.contentType?.sys?.id === "page" ? "page" as const : "post" as const,
      title: entry.fields?.title || "",
      excerpt: entry.fields?.excerpt || entry.fields?.description || "",
      slug: entry.fields?.slug || "",
      url: entry.sys?.contentType?.sys?.id === "page"
        ? `/${entry.fields?.slug}`
        : `/blog/${entry.fields?.slug}`,
    }));
  },

  async getRelatedContent(input) {
    if (input.type !== "post") return [];
    const data = await contentfulFetch(`/entries?content_type=post&limit=${input.limit || 3}`);
    if (!data?.items) return [];
    return (data.items as any[])
      .filter((e: any) => e.fields?.slug !== input.slug)
      .map((entry: any) => ({
        id: entry.sys?.id || "",
        type: "post" as const,
        title: entry.fields?.title || "",
        excerpt: entry.fields?.excerpt || "",
        slug: entry.fields?.slug || "",
        url: `/blog/${entry.fields?.slug}`,
      }));
  },

  async getTeamMember(slug) {
    const data = await contentfulFetch(`/entries?content_type=teamMember&fields.slug=${slug}&limit=1&include=2`);
    const entry = data?.items?.[0];
    if (!entry?.fields) return null;
    const f = entry.fields;
    const assets = data.includes?.Asset || [];
    return {
      name: f.name || "",
      slug: f.slug || slug,
      role: f.role || "",
      bio: f.bio || "",
      photo: f.photo?.sys?.id
        ? resolveContentfulAsset(f.photo.sys.id, assets)
        : mapContentfulImage(f.photo),
      email: f.email || "",
      website: f.website || "",
      linkedin: f.linkedin || "",
      twitter: f.twitter || "",
      github: f.github || "",
    };
  },

  async getTeamMembers() {
    const data = await contentfulFetch(`/entries?content_type=teamMember&limit=50&order=fields.name&include=2`);
    if (!data?.items) return [];
    const assets = data.includes?.Asset || [];
    return (data.items as any[]).map((entry: any) => {
      const f = entry.fields;
      return {
        name: f.name || "",
        slug: f.slug || "",
        role: f.role || "",
        bio: f.bio || "",
        photo: f.photo?.sys?.id
          ? resolveContentfulAsset(f.photo.sys.id, assets)
          : mapContentfulImage(f.photo),
        email: f.email || "",
        website: f.website || "",
        linkedin: f.linkedin || "",
        twitter: f.twitter || "",
        github: f.github || "",
      };
    });
  },

  async getPostsByTeamMember(slug) {
    const data = await contentfulFetch(`/entries?content_type=post&fields.author.fields.slug=${slug}&limit=20&include=2`);
    if (!data?.items) return [];
    const assets = data.includes?.Asset || [];
    return (data.items as any[]).map((e: any) => mapContentfulPost(e, assets)).filter(Boolean) as any[];
  },

  async getPage(slug) {
    const data = await contentfulFetch(
      `/entries?content_type=page&fields.slug=${slug}&limit=1&include=2`
    );
    const assets = data?.includes?.Asset || [];
    return mapContentfulPage(data?.items?.[0], assets);
  },

  async getPosts() {
    const data = await contentfulFetch(
      `/entries?content_type=post&order=-fields.publishedAt&limit=20&include=2`
    );
    if (!Array.isArray(data?.items)) return [];
    const assets = data.includes?.Asset || [];
    return data.items.map((e: any) => mapContentfulPost(e, assets)).filter(Boolean) as NormalizedPost[];
  },

  async getPost(slug) {
    const data = await contentfulFetch(
      `/entries?content_type=post&fields.slug=${slug}&limit=1&include=2`
    );
    const assets = data?.includes?.Asset || [];
    return mapContentfulPost(data?.items?.[0], assets);
  },

  async getMenu(name): Promise<NormalizedMenu | null> {
    // Contentful menus require a custom content type named "menu" or "navigation"
    // Try to fetch menu entries by content type
    const data = await contentfulFetch(`/entries?content_type=menu&limit=10`);
    if (!data?.items) return { name, items: [] };

    // Look for matching menu by name field
    const menu = data.items.find((m: any) =>
      m.fields?.name?.toLowerCase() === name.toLowerCase() ||
      m.fields?.title?.toLowerCase() === name.toLowerCase()
    );

    if (menu?.fields?.items) {
      const items = menu.fields.items;
      return {
        name,
        items: Array.isArray(items)
          ? items.map((item: any) => ({
              label: item.fields?.label || item.label || "",
              url: item.fields?.url || item.url || "#",
              type: item.type || "custom",
              description: item.fields?.description || "",
              targetBlank: Boolean(item.fields?.targetBlank),
              children: Array.isArray(item.fields?.children)
                ? item.fields.children.map((child: any) => ({
                    label: child.fields?.label || child.label || "",
                    url: child.fields?.url || child.url || "#",
                  }))
                : [],
            }))
          : [],
      };
    }

    // Also try "navigation" content type
    const navData = await contentfulFetch(`/entries?content_type=navigation&limit=10`);
    if (navData?.items) {
      const nav = navData.items.find((m: any) =>
        m.fields?.name?.toLowerCase() === name.toLowerCase() ||
        m.fields?.title?.toLowerCase() === name.toLowerCase()
      );

      if (nav?.fields?.items) {
        return {
          name,
          items: Array.isArray(nav.fields.items)
            ? nav.fields.items.map((item: any) => ({
                label: item.fields?.label || item.label || "",
                url: item.fields?.url || item.url || "#",
                children: Array.isArray(item.fields?.children)
                  ? item.fields.children.map((child: any) => ({
                      label: child.fields?.label || child.label || "",
                      url: child.fields?.url || child.url || "#",
                    }))
                  : [],
              }))
            : [],
        };
      }
    }

    return { name, items: [] };
  },

  async getSiteSettings(): Promise<NormalizedSiteSettings> {
    // Contentful site settings require a singleton content type
    // Try common content type names: "siteSettings", "siteConfig", "settings"
    for (const ct of ["siteSettings", "siteConfig", "settings"]) {
      const data = await contentfulFetch(`/entries?content_type=${ct}&limit=1&include=2`);
      if (data?.items?.[0]?.fields) {
        const fields = data.items[0].fields;
        const assets = data.includes?.Asset || [];
        const logo = fields.logo?.sys?.id
          ? resolveContentfulAsset(fields.logo.sys.id, assets)
          : mapContentfulImage(fields.logo);
        const favicon = fields.favicon?.sys?.id
          ? resolveContentfulAsset(fields.favicon.sys.id, assets)
          : mapContentfulImage(fields.favicon);
        return {
          siteTitle: fields.siteTitle || fields.title || "KapiLabs",
          tagline: fields.tagline || fields.description || "",
          logo,
          favicon,
          phone: fields.phone || "",
          email: fields.email || "",
          address: fields.address || "",
          social: fields.social || {},
          theme: fields.theme || {},
        };
      }
    }

    return {
      siteTitle: "KapiLabs",
      tagline: "",
      logo: null,
      phone: "",
      email: "",
      address: "",
      social: {},
      theme: {},
    };
  },

  async getWidgets(): Promise<NormalizedWidget[]> {
    // Contentful widgets require a custom content type named "widget"
    const data = await contentfulFetch(`/entries?content_type=widget&limit=50`);
    if (!data?.items) return [];
    return (data.items as any[]).map((entry: any) => {
      const f = entry.fields;
      return {
        id: entry.sys?.id || "",
        area: f.area || "sidebar",
        type: f.type || "html",
        title: f.title || "",
        content: f.content || "",
        menuName: f.menuName || "",
        buttonLabel: f.buttonLabel || "",
        buttonUrl: f.buttonUrl || "",
      };
    });
  },

  async getGlobalSections() {
    // Contentful global sections require a custom content type named "globalSection"
    const data = await contentfulFetch(`/entries?content_type=globalSection&limit=20`);
    if (!data?.items) return [];
    return (data.items as any[]).map((entry: any) => {
      const f = entry.fields;
      return {
        title: f.title || "",
        key: f.key || "",
        sectionType: f.sectionType || "",
        content: f.content || {},
      };
    });
  },

  async getGlobalSection(key: string) {
    const data = await contentfulFetch(`/entries?content_type=globalSection&fields.key=${key}&limit=1`);
    const entry = data?.items?.[0];
    if (!entry?.fields) return null;
    return {
      title: entry.fields.title || "",
      key: entry.fields.key || key,
      sectionType: entry.fields.sectionType || "",
      content: entry.fields.content || {},
    };
  },

  async getThemeSettings(): Promise<CmsThemeSettings> {
    // Contentful theme settings require a custom content type named "themeSettings"
    const data = await contentfulFetch(`/entries?content_type=themeSettings&limit=1`);
    if (data?.items?.[0]?.fields) {
      const f = data.items[0].fields;
      return {
        primaryColor: f.primaryColor || "#111827",
        secondaryColor: f.secondaryColor || "#2563eb",
        backgroundColor: f.backgroundColor || "#ffffff",
        textColor: f.textColor || "#111827",
        tokens: f.tokens || {},
        typography: f.typography || {},
        containerWidth: f.containerWidth || "1200px",
        buttonStyle: f.buttonStyle || "rounded",
        header: f.header || {},
        footer: f.footer || {},
      };
    }
    return {
      primaryColor: "#111827",
      secondaryColor: "#2563eb",
      backgroundColor: "#ffffff",
      textColor: "#111827",
      tokens: {},
      typography: {},
      containerWidth: "1200px",
      buttonStyle: "rounded",
      header: {},
      footer: {},
    };
  },

  async getForms() {
    const data = await contentfulFetch(`/entries?content_type=form&limit=20`);
    if (!data?.items) return [];
    return (data.items as any[]).map((entry: any) => {
      const f = entry.fields;
      return {
        id: entry.sys?.id || "",
        title: f.title || "",
        formType: f.formType || "contact",
        successMessage: f.successMessage || "",
        emailTo: f.emailTo || "",
        fields: Array.isArray(f.fields)
          ? f.fields.map((field: any) => ({
              name: field.fields?.name || field.name || "",
              label: field.fields?.label || field.label || "",
              type: field.fields?.type || field.type || "text",
              placeholder: field.fields?.placeholder || field.placeholder || "",
              required: Boolean(field.fields?.required || field.required),
              options: Array.isArray(field.fields?.options) ? field.fields.options : field.options || [],
            }))
          : [],
      };
    });
  },

  async getTaxonomies(type) {
    // Contentful doesn't have native taxonomies; requires custom content types
    // Try fetching category and tag entries
    const results: any[] = [];
    if (!type || type === "category") {
      const catData = await contentfulFetch(`/entries?content_type=category&limit=50`);
      if (catData?.items) {
        (catData.items as any[]).forEach((entry: any) => {
          results.push({
            id: entry.sys?.id || "",
            name: entry.fields?.name || "",
            slug: entry.fields?.slug || "",
            count: entry.fields?.count || 0,
            type: "category" as const,
          });
        });
      }
    }
    if (!type || type === "tag") {
      const tagData = await contentfulFetch(`/entries?content_type=tag&limit=50`);
      if (tagData?.items) {
        (tagData.items as any[]).forEach((entry: any) => {
          results.push({
            id: entry.sys?.id || "",
            name: entry.fields?.name || "",
            slug: entry.fields?.slug || "",
            count: entry.fields?.count || 0,
            type: "tag" as const,
          });
        });
      }
    }
    return results;
  },

  async getSavedSection(slug: string) {
    const data = await contentfulFetch(`/entries?content_type=savedSection&fields.slug=${slug}&limit=1`);
    const entry = data?.items?.[0];
    if (!entry?.fields) return null;
    const f = entry.fields;
    return {
      id: entry.sys?.id || "",
      title: f.title || "",
      slug: f.slug || slug,
      description: f.description || "",
      category: f.category || "",
      sectionType: f.sectionType || "",
      content: f.content || {},
      version: f.version || 1,
      status: f.status || "draft",
    };
  },

  // ── Premium Content: Advanced Search ──────────────────────────────────────────

  async searchAdvanced(query, filter, options) {
    const results = await this.search(query, filter);
    return {
      results,
      total: results.length,
      facets: { types: [], categories: [], tags: [], dateRanges: [] },
      page: options?.page || 1,
      pageSize: options?.pageSize || 20,
    };
  },

  // ── Premium Content: Knowledge Base ───────────────────────────────────────────
  // Contentful KB uses content types "knowledgeBaseCategory" and "knowledgeBaseArticle".
  // These must be created in your Contentful space with the correct field names.

  async getKnowledgeBaseCategories() {
    const data = await contentfulFetch(`/entries?content_type=knowledgeBaseCategory&limit=50`);
    if (!data?.items) return [];
    return (data.items as any[]).map((c: any) => ({
      id: c.sys?.id || "",
      title: c.fields?.title || "",
      slug: c.fields?.slug || "",
      description: c.fields?.description || "",
      articleCount: c.fields?.articleCount || 0,
    }));
  },

  async getKnowledgeBaseArticles(options) {
    let path = `/entries?content_type=knowledgeBaseArticle&limit=${options?.pageSize || 20}`;
    if (options?.categorySlug) path += `&fields.category.fields.slug=${options.categorySlug}`;
    if (options?.search) path += `&query=${encodeURIComponent(options.search)}`;
    const data = await contentfulFetch(path);
    if (!data?.items) return { articles: [], total: 0 };
    return {
      articles: (data.items as any[]).map((a: any) => ({
        id: a.sys?.id || "",
        title: a.fields?.title || "",
        slug: a.fields?.slug || "",
        excerpt: a.fields?.excerpt || "",
        publishedAt: a.fields?.publishedAt || "",
      })),
      total: data.total || data.items.length,
    };
  },

  async getKnowledgeBaseArticle(slug) {
    const data = await contentfulFetch(`/entries?content_type=knowledgeBaseArticle&fields.slug=${slug}&limit=1`);
    const entry = data?.items?.[0];
    if (!entry?.fields) return null;
    return {
      id: entry.sys?.id || "",
      title: entry.fields.title || "",
      slug: entry.fields.slug || slug,
      excerpt: entry.fields.excerpt || "",
      content: entry.fields.content || "",
      publishedAt: entry.fields.publishedAt || "",
    };
  },

  async getKnowledgeBaseTree() {
    const data = await contentfulFetch(`/entries?content_type=knowledgeBaseCategory&limit=50`);
    return {
      categories: Array.isArray(data?.items) ? data.items.map((c: any) => ({
        id: c.sys?.id || "",
        title: c.fields?.title || "",
        slug: c.fields?.slug || "",
        description: c.fields?.description || "",
        articleCount: c.fields?.articleCount || 0,
      })) : [],
      uncategorizedCount: 0,
    };
  },

  // ── Premium Marketing: Newsletter ─────────────────────────────────────────────

  async getNewsletterConfig() { return null; },    async getSavedSections(options) {
    let path = `/entries?content_type=savedSection&limit=50`;
    if (options?.category) {
      path += `&fields.category=${options.category}`;
    }
    if (options?.type) {
      path += `&fields.sectionType=${options.type}`;
    }
    const data = await contentfulFetch(path);
    if (!data?.items) return [];
    return (data.items as any[]).map((entry: any) => {
      const f = entry.fields;
      return {
        id: entry.sys?.id || "",
        title: f.title || "",
        slug: f.slug || "",
        description: f.description || "",
        category: f.category || "",
        sectionType: f.sectionType || "",
        content: f.content || {},
        thumbnail: f.thumbnail?.fields?.file?.url ? { src: `https:${f.thumbnail.fields.file.url}` } : undefined,
        version: f.version || 1,
        status: f.status || "draft",
      };
    });
  },
};
