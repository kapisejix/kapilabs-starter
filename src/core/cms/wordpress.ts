import { sanitizeContent } from "../utils/sanitizeHtml";

import type {
  CmsAdapter,
  CmsImage,
  CmsThemeSettings,
  NormalizedMenu,
  NormalizedPage,
  NormalizedPost,
  NormalizedSiteSettings,
  NormalizedWidget,
} from "./types";
import type {
  RawWpPage,
  RawWpPost,
  RawWpTerm,
} from "./raw-types";

const WORDPRESS_API_URL =
  import.meta.env.WORDPRESS_API_URL || "https://example.com/wp-json/wp/v2";

async function wpFetch(path: string, base: string = WORDPRESS_API_URL) {
  const res = await fetch(`${base}${path}`);

  if (!res.ok) {
    console.warn(`WordPress fetch failed: ${path}`);
    return null;
  }

  return res.json();
}

function cleanHtml(html: string = ""): string {
  return sanitizeContent(html);
}

function mapWpFeaturedImage(post: RawWpPost | RawWpPage): CmsImage | null {
  const media = post._embedded?.["wp:featuredmedia"]?.[0];
  if (!media?.source_url) return null;

  const img: CmsImage = {
    src: media.source_url,
    alt: media.alt_text || "",
    width: media.media_details?.width,
    height: media.media_details?.height,
    caption: media.caption?.rendered || "",
    credit: media.media_details?.credit || media.credit || "",
  };

  // Try to get the largest responsive size available
  // Order: full → large → medium_large → medium
  const preferredSizes = ["full", "large", "medium_large", "medium"];
  for (const size of preferredSizes) {
    const s = media.media_details?.sizes?.[size];
    if (s?.source_url) {
      img.src = s.source_url;
      img.width = s.width;
      img.height = s.height;
      break;
    }
  }

  // LQIP: use the smallest available size as a blur-up placeholder.
  // WordPress doesn't generate native LQIP, but the thumbnail (150x150)
  // serves as a lightweight placeholder that can be blurred in CSS.
  // Priority: thumbnail →  medium
  if (media.media_details?.sizes?.thumbnail?.source_url) {
    img.lqip = media.media_details.sizes.thumbnail.source_url;
  } else if (media.media_details?.sizes?.medium?.source_url) {
    // Use medium but downsampled via query param if available
    img.lqip = media.media_details.sizes.medium.source_url;
  }

  return img;
}

function mapWpSeo(post: RawWpPage | RawWpPost) {
  // Yoast SEO
  const yoast = post.yoast_head_json;
  if (yoast) {
    return {
      title: yoast.title || post.title?.rendered || "",
      description: yoast.description || post.excerpt?.rendered || "",
      canonicalUrl: yoast.canonical || "",
      noindex: yoast.robots?.index === "noindex" || false,
      nofollow: yoast.robots?.follow === "nofollow" || false,
      image: yoast.og_image?.[0]?.url || yoast.twitter_image || "",
      ogType: yoast.og_type === "article" ? "article" as const : "website" as const,
      twitterCard: yoast.twitter_card === "summary_large_image" ? "summary_large_image" as const : "summary" as const,
    };
  }

  // Rank Math SEO
  const rankMath = post.rank_math;
  if (rankMath) {
    return {
      title: rankMath.title || post.title?.rendered || "",
      description: rankMath.description || post.excerpt?.rendered || "",
      canonicalUrl: rankMath.canonical_url || "",
      noindex: rankMath.robots?.index === "noindex" || false,
      nofollow: rankMath.robots?.follow === "nofollow" || false,
      image: rankMath.thumbnail || "",
      twitterCard: "summary_large_image" as const,
    };
  }

  return {
    title: post.title?.rendered || "",
    description: post.excerpt?.rendered || "",
    image: "",
  };
}

function mapWpCategories(post: RawWpPost): string[] {
  return post._embedded?.["wp:term"]?.[0]?.map((t: RawWpTerm): string => t.name || "") || post.categories || [];
}

function mapWpTags(post: RawWpPost): string[] {
  return post._embedded?.["wp:term"]?.[1]?.map((t: RawWpTerm): string => t.name || "") || post.tags || [];
}

function mapWpAuthor(post: RawWpPost) {
  const author = post._embedded?.author?.[0];
  if (!author) return undefined;

  const avatarSrc = author.avatar_urls?.["96"] || author.avatar_urls?.["48"] || null;
  const avatarLqip = author.avatar_urls?.["24"] || undefined;

  return {
    name: author.name || "",
    slug: author.slug || "",
    role: author.description || "",
    bio: author.description || "",
    photo: avatarSrc
      ? { src: avatarSrc, alt: author.name || "", width: 96, height: 96, lqip: avatarLqip }
      : null,
    email: "",
    website: author.url || "",
    linkedin: "",
    twitter: "",
    github: "",
  };
}

function mapWpPage(page: RawWpPage | undefined | null): NormalizedPage | null {
  if (!page) return null;

  return {
    title: page.title?.rendered || "",
    slug: page.slug || "",
    template: page.template || "default",
    layout: "content-sidebar",
    content: cleanHtml(page.content?.rendered || ""),
    sections: [],
    featuredImage: mapWpFeaturedImage(page),
    seo: mapWpSeo(page),
  };
}

function mapWpPost(post: RawWpPost | undefined | null): NormalizedPost | null {
  if (!post) return null;

  return {
    title: post.title?.rendered || "",
    slug: post.slug || "",
    excerpt: post.excerpt?.rendered || "",
    content: cleanHtml(post.content?.rendered || ""),
    publishedAt: post.date,
    categories: mapWpCategories(post),
    tags: mapWpTags(post),
    featuredImage: mapWpFeaturedImage(post),
    author: mapWpAuthor(post),
    seo: mapWpSeo(post),
  };
}

export const wordpressAdapter: CmsAdapter = {
  async search(query, _filter?) {
    const data = await wpFetch(`/search?search=${encodeURIComponent(query)}&per_page=20&type=any`);
    if (!Array.isArray(data)) return [];
    return data.map((item: any) => ({
      id: String(item.id),
      type: item.subtype === "page" ? "page" as const : "post" as const,
      title: item.title || "",
      excerpt: "",
      slug: item.slug || "",
      url: item.url || (item.subtype === "page" ? `/${item.slug}` : `/blog/${item.slug}`),
    }));
  },

  async getRelatedContent(input) {
    if (input.type !== "post") return [];
    const data = await wpFetch(`/posts?per_page=${input.limit || 3}&_embed`);
    if (!Array.isArray(data)) return [];
    return data.map((post: any) => ({
      id: String(post.id),
      type: "post" as const,
      title: post.title?.rendered || "",
      excerpt: post.excerpt?.rendered || "",
      slug: post.slug || "",
      url: `/blog/${post.slug}`,
    }));
  },

  async getTeamMember(slug) {
    const data = await wpFetch(`/team_member?slug=${slug}&_embed`);
    const member = Array.isArray(data) ? data[0] : null;
    if (!member) return null;
    return {
      name: member.title?.rendered || member.name || slug,
      slug: member.slug || slug,
      role: member.acf?.role || member.meta?.role || "",
      bio: member.content?.rendered || member.acf?.bio || "",
      photo: mapWpFeaturedImage(member),
      email: member.acf?.email || "",
      website: member.acf?.website || "",
      linkedin: member.acf?.linkedin || "",
      twitter: member.acf?.twitter || "",
      github: member.acf?.github || "",
    };
  },

  async getTeamMembers() {
    const data = await wpFetch(`/team_member?per_page=50&_embed`);
    if (!Array.isArray(data)) return [];
    return data.map((member: any) => ({
      name: member.title?.rendered || member.name || member.slug,
      slug: member.slug || "",
      role: member.acf?.role || member.meta?.role || "",
      bio: member.content?.rendered || member.acf?.bio || "",
      photo: mapWpFeaturedImage(member),
      email: member.acf?.email || "",
      website: member.acf?.website || "",
      linkedin: member.acf?.linkedin || "",
      twitter: member.acf?.twitter || "",
      github: member.acf?.github || "",
    }));
  },

  async getPostsByTeamMember(slug) {
    const authors = await wpFetch(`/users?slug=${slug}`);
    const authorId = Array.isArray(authors) && authors[0] ? authors[0].id : null;
    if (!authorId) return [];
    const posts = await wpFetch(`/posts?author=${authorId}&per_page=20&_embed`);
    return Array.isArray(posts) ? (posts.map(mapWpPost).filter(Boolean) as NormalizedPost[]) : [];
  },

  async getPage(slug) {
    // Fetch with _embed to get featured images, categories, etc.
    const pages = await wpFetch(`/pages?slug=${slug}&_embed`);
    return mapWpPage(Array.isArray(pages) ? pages[0] : null);
  },

  async getPosts() {
    const posts = await wpFetch(`/posts?per_page=20&_embed`);
    return Array.isArray(posts)
      ? posts.map(mapWpPost).filter(Boolean) as NormalizedPost[]
      : [];
  },

  async getPost(slug) {
    const posts = await wpFetch(`/posts?slug=${slug}&_embed`);
    return mapWpPost(Array.isArray(posts) ? posts[0] : null);
  },

  async getMenu(name): Promise<NormalizedMenu | null> {
    // Try common WordPress menu REST API endpoints with fallbacks.
    // 1. WP API Menus plugin: /menus/v1/menus/<slug>
    // 2. Jetpack: /wp/v2/menus?slug=<name>
    // 3. Custom endpoint registered by theme: /kapilabs/v1/menu/<name>
    const baseUrl = WORDPRESS_API_URL.replace("/wp/v2", "");

    const endpoints = [
      `${baseUrl}/menus/v1/menus/${name}`,
      `${WORDPRESS_API_URL}/menus?slug=${name}`,
      `${baseUrl}/kapilabs/v1/menu/${name}`,
    ];

    for (const endpoint of endpoints) {
      try {
        const res = await fetch(endpoint);
        if (res.ok) {
          const data = await res.json();

          // Normalize various menu response formats
          const items = data.items || data.menu_items || data;
          if (Array.isArray(items) && items.length > 0) {
            return {
              name,
              items: items.map((item: any) => ({
                label: item.label || item.title || item.name || "",
                url: item.url || item.link || item.href || "#",
                type: item.type || "custom",
                description: item.description || "",
                icon: item.icon || "",
                cssClass: item.classes?.join(" ") || item.cssClass || "",
                targetBlank: Boolean(item.target === "_blank" || item.targetBlank),
                children: Array.isArray(item.children)
                  ? item.children.map((child: any) => ({
                      label: child.label || child.title || child.name || "",
                      url: child.url || child.link || child.href || "#",
                      type: child.type || "custom",
                    }))
                  : [],
              })),
            };
          }
        }
      } catch {
        // Silently try next endpoint
      }
    }

    // Fallback: try fetching menus registered as a custom post type
    try {
      const menus = await wpFetch(`/menu?per_page=50`);
      if (Array.isArray(menus)) {
        const menu = menus.find((m: any) =>
          m.slug === name || m.title?.rendered?.toLowerCase() === name.toLowerCase()
        );
        if (menu) {
          const items = menu.items || [];
          return {
            name,
            items: Array.isArray(items) ? items.map((item: any) => ({
              label: item.label || item.title || "",
              url: item.url || item.link || "#",
              type: item.type || "custom",
              children: Array.isArray(item.children) ? item.children.map((c: any) => ({
                label: c.label || c.title || "",
                url: c.url || c.link || "#",
              })) : [],
            })) : [],
          };
        }
      }
    } catch {
      // Silently fall through
    }

    // Last resort: return empty menu
    return { name, items: [] };
  },

  async getThemeSettings(): Promise<CmsThemeSettings> {
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

  async getSiteSettings(): Promise<NormalizedSiteSettings> {
    // Try to fetch actual site info from WordPress
    const baseUrl = WORDPRESS_API_URL.replace("/wp/v2", "");

    // Fetch site root info
    const root = await wpFetch("", baseUrl);

    // Try to get settings (requires WP REST API settings permission)
    const settings = await wpFetch(`/settings`);

    return {
      siteTitle: settings?.title || root?.name || "KapiLabs",
      tagline: settings?.description || root?.description || "",
      logo: settings?.site_logo
        ? { src: settings.site_logo }
        : root?.site_icon_url
          ? { src: root.site_icon_url }
          : null,
      phone: "",
      email: settings?.email || "",
      address: "",
      social: {},
      theme: {},
    };
  },

  async getWidgets(): Promise<NormalizedWidget[]> {
    // WordPress widgets are typically PHP-side and not exposed via REST API
    // Try common widget endpoints
    const baseUrl = WORDPRESS_API_URL.replace("/wp/v2", "");
    const data = await wpFetch(`/widgets`, baseUrl);
    if (!Array.isArray(data)) return [];
    return data.map((widget: any) => ({
      id: widget.id || widget._id,
      area: widget.sidebar || widget.widgetArea || "sidebar",
      type: widget.type || "html",
      title: widget.name || widget.title || "",
      content: widget.content || widget.html || "",
      menuName: widget.menuName || "",
      buttonLabel: widget.buttonLabel || "",
      buttonUrl: widget.buttonUrl || "",
    }));
  },

  async getGlobalSections() {
    // WordPress doesn't have global sections natively; would need ACF options page
    return [];
  },

  async getGlobalSection(_key: string) {
    return null;
  },

  async getForms() {
    // WordPress doesn't have native forms API; requires plugin (e.g., Gravity Forms, CF7)
    try {
      const forms = await wpFetch(`/gf/v2/forms`);
      if (Array.isArray(forms)) {
        return forms.map((f: any) => ({
          id: String(f.id),
          title: f.title || "",
          formType: "contact",
          fields: (f.fields || []).map((field: any) => ({
            name: field.label || `field_${field.id}`,
            label: field.label || "",
            type: field.type || "text",
            placeholder: field.placeholder || "",
            required: Boolean(field.isRequired),
            options: field.choices || field.options || [],
          })),
        }));
      }
    } catch {
      // Plugin not available
    }
    return [];
  },

  async getTaxonomies(type) {
    try {
      if (!type || type === "category") {
        const categories = await wpFetch(`/categories?per_page=50`);
        if (Array.isArray(categories)) {
          return categories.map((c: any) => ({
            id: String(c.id),
            name: c.name || "",
            slug: c.slug || "",
            count: c.count || 0,
            type: "category" as const,
          }));
        }
      }
      if (!type || type === "tag") {
        const tags = await wpFetch(`/tags?per_page=50`);
        if (Array.isArray(tags)) {
          return tags.map((t: any) => ({
            id: String(t.id),
            name: t.name || "",
            slug: t.slug || "",
            count: t.count || 0,
            type: "tag" as const,
          }));
        }
      }
    } catch {
      // Ignore errors
    }
    return [];
  },    async getSavedSection(_slug: string) {
    // WordPress doesn't have saved sections natively; requires ACF or custom post type
    return null;
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
  // WordPress KB uses a custom post type "kb_article" with taxonomy "kb_category".
  // If your WP install uses a different slug, override the WORDPRESS_API_URL prefix.

  async getKnowledgeBaseCategories() {
    try {
      const data = await wpFetch(`/kb_category?per_page=50`);
      if (Array.isArray(data)) {
        return data.map((c: any) => ({
          id: String(c.id),
          title: c.name || "",
          slug: c.slug || "",
          description: c.description || "",
          articleCount: c.count || 0,
        }));
      }
    } catch { /* fall through */ }
    return [];
  },

  async getKnowledgeBaseArticles(options) {
    try {
      let path = `/kb_article?per_page=${options?.pageSize || 20}&_embed`;
      if (options?.categorySlug) path += `&kb_category=${options.categorySlug}`;
      if (options?.search) path += `&search=${encodeURIComponent(options.search)}`;
      const data = await wpFetch(path);
      if (Array.isArray(data)) {
        return {
          articles: data.map((a: any) => ({
            id: String(a.id),
            title: a.title?.rendered || "",
            slug: a.slug || "",
            excerpt: a.excerpt?.rendered || "",
            publishedAt: a.date || "",
          })),
          total: data.length,
        };
      }
    } catch { /* fall through */ }
    return { articles: [], total: 0 };
  },

  async getKnowledgeBaseArticle(slug) {
    try {
      const data = await wpFetch(`/kb_article?slug=${slug}&_embed`);
      const article = Array.isArray(data) ? data[0] : null;
      if (article) {
        return {
          id: String(article.id),
          title: article.title?.rendered || "",
          slug: article.slug || slug,
          excerpt: article.excerpt?.rendered || "",
          content: article.content?.rendered || "",
          publishedAt: article.date || "",
        };
      }
    } catch { /* fall through */ }
    return null;
  },

  async getKnowledgeBaseTree() {
    try {
      const cats = await wpFetch(`/kb_category?per_page=50&hide_empty=true`);
      return {
        categories: Array.isArray(cats) ? cats.map((c: any) => ({
          id: String(c.id),
          title: c.name || "",
          slug: c.slug || "",
          description: c.description || "",
          articleCount: c.count || 0,
        })) : [],
        uncategorizedCount: 0,
      };
    } catch { /* fall through */ }
    return { categories: [], uncategorizedCount: 0 };
  },

  // ── Premium Marketing: Newsletter ─────────────────────────────────────────────

  async getNewsletterConfig() { return null; },

  async getSavedSections() {
    return [];
  },
};
