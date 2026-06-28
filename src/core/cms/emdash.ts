import type {
  CmsBanner,
  CmsAdapter,
  CmsImage,
  CmsMenu,
  CmsThemeSettings,
  NormalizedMenu,
  NormalizedPage,
  NormalizedPost,
  NormalizedSection,
  NormalizedSiteSettings,
  NormalizedWidget,
} from "./types";
import type {
  RawEmDashImage,
  RawEmDashMenu,
  RawEmDashPage,
  RawEmDashPost,
} from "./raw-types";

const EMDASH_API_URL =
  import.meta.env.EMDASH_API_URL || "http://localhost:3000/api";

async function emdashFetch(path: string) {
  try {
    const res = await fetch(`${EMDASH_API_URL}${path}`);

    if (!res.ok) {
      console.warn(`EmDash fetch failed: ${path}`);
      return null;
    }

    return res.json();
  } catch (error) {
    console.warn(`EmDash fetch error: ${path}`, error);
    return null;
  }
}

function normalizeSlug(slug: string = "") {
  return slug.replace(/^\/+|\/+$/g, "") || "home";
}

function mapEmDashImage(img: RawEmDashImage | undefined | null, alt: string): CmsImage | null {
  if (!img) return null;
  if (typeof img === "string") return { src: img, alt };
  return {
    src: img.src || img.url || "",
    alt: img.alt || alt,
    width: img.width,
    height: img.height,
    caption: img.caption,
    credit: img.credit,
    lqip: img.lqip,
    focalPoint: img.focalPoint,
  };
}

function mapEmDashPage(page: RawEmDashPage | undefined | null): NormalizedPage | null {
  if (!page) return null;

  const b = page.banner;
  return {
    title: page.title || "",
    slug: normalizeSlug(page.slug || page.path),
    template: page.template || "default",
    layout: page.layout || "content-sidebar",
    content: page.content || page.html || "",
    sections: Array.isArray(page.sections) ? page.sections as NormalizedSection[] : [],
    featuredImage: mapEmDashImage(page.featuredImage, page.title || ""),
    banner: b
      ? {
          eyebrow: b.eyebrow,
          heading: b.heading,
          text: b.text,
          image: mapEmDashImage(b.image, (b.heading || page.title) || ""),
          overlay: b.overlay,
          alignment: b.alignment as "left" | "center" | "right" | undefined,
        }
      : undefined,
    seo: {
      title: page.seo?.title || page.title || "",
      description: page.seo?.description || page.excerpt || "",
      image: page.seo?.image || (page.featuredImage ? (typeof page.featuredImage === "string" ? page.featuredImage : page.featuredImage.src || "") : ""),
      canonicalUrl: page.seo?.canonicalUrl || "",
      noindex: page.seo?.noindex || false,
      nofollow: page.seo?.nofollow || false,
      ogType: (page.seo?.ogType as "website" | "article") || "website",
      twitterCard: (page.seo?.twitterCard as "summary" | "summary_large_image") || "summary_large_image",
    },
    customCode: page.customCode || {},
  };
}

function mapEmDashPost(post: RawEmDashPost | undefined | null): NormalizedPost | null {
  if (!post) return null;

  return {
    title: post.title || "",
    slug: normalizeSlug(post.slug),
    excerpt: post.excerpt || "",
    content: post.content || post.html || "",
    publishedAt: post.publishedAt || post.createdAt || "",
    categories: post.categories || [],
    tags: post.tags || [],
    featuredImage: mapEmDashImage(post.featuredImage, post.title || ""),
    ogImage: mapEmDashImage(post.ogImage, post.title || ""),
    archiveImage: mapEmDashImage(post.archiveImage, post.title || ""),
    banner: post.banner
      ? {
          eyebrow: post.banner.eyebrow,
          heading: post.banner.heading,
          text: post.banner.text,
          image: mapEmDashImage(post.banner.image, (post.banner.heading || post.title) || ""),
          overlay: post.banner.overlay,
          alignment: post.banner.alignment as CmsBanner["alignment"],
        }
      : undefined,
    author: post.author
      ? {
          name: post.author.name || "",
          slug: post.author.slug || "",
          role: post.author.role || "",
          bio: post.author.bio || "",
          photo: mapEmDashImage(post.author.photo, post.author.name || ""),
          email: post.author.email || "",
          website: post.author.website || "",
          linkedin: post.author.linkedin || "",
          twitter: post.author.twitter || "",
          github: post.author.github || "",
        }
      : undefined,
    seo: {
      title: post.seo?.title || post.title || "",
      description: post.seo?.description || post.excerpt || "",
      image: post.seo?.image || (post.featuredImage ? (typeof post.featuredImage === "string" ? post.featuredImage : post.featuredImage.src || "") : ""),
      canonicalUrl: post.seo?.canonicalUrl || "",
      noindex: post.seo?.noindex || false,
      nofollow: post.seo?.nofollow || false,
      ogType: (post.seo?.ogType as "website" | "article") || "article",
      twitterCard: (post.seo?.twitterCard as "summary" | "summary_large_image") || "summary_large_image",
    },
    customCode: post.customCode || {},
  };
}

function mapEmDashMenu(menu: RawEmDashMenu | undefined | null, name: string): NormalizedMenu {
  return {
    name: menu?.name || name,
    location: menu?.location as CmsMenu["location"],
    schemaVersion: menu?.schemaVersion || 1,
    items: Array.isArray(menu?.items)
      ? menu.items.map((item: any) => ({
          label: item.label || item.title || "",
          url: item.url || item.href || "#",
          type: item.itemType || item.type || "custom",
          description: item.description || "",
          icon: item.icon || "",
          cssClass: item.cssClass || "",
          targetBlank: Boolean(item.targetBlank || item.target === "_blank"),
          isMegaMenu: Boolean(item.isMegaMenu),
          megaMenuColumns: item.megaMenuColumns || 3,
          children: Array.isArray(item.children)
            ? item.children.map((child: any) => ({
                label: child.label || child.title || "",
                url: child.url || child.href || "#",
                type: child.type || "custom",
                description: child.description || "",
                icon: child.icon || "",
                cssClass: child.cssClass || "",
                targetBlank: Boolean(child.targetBlank),
              }))
            : [],
        }))
      : [],
  };
}

export const emdashAdapter: CmsAdapter = {
  async search(query, _filter?) {
    const data = await emdashFetch(`/search?q=${encodeURIComponent(query)}`);
    if (!Array.isArray(data)) return [];
    return data.map((item: any) => ({
      id: String(item.id || item._id || ""),
      type: item.type === "page" ? "page" as const : "post" as const,
      title: item.title || "",
      excerpt: item.excerpt || "",
      slug: normalizeSlug(item.slug || item.path || ""),
      url: item.url || (item.type === "page" ? `/${item.slug}` : `/blog/${item.slug}`),
    }));
  },

  async getRelatedContent(input) {
    if (input.type !== "post") return [];
    const data = await emdashFetch(`/posts/related?slug=${encodeURIComponent(input.slug)}&limit=${input.limit || 3}`);
    if (!Array.isArray(data)) return [];
    return data.map((item: any) => ({
      id: String(item.id || item._id || ""),
      type: "post" as const,
      title: item.title || "",
      excerpt: item.excerpt || "",
      slug: normalizeSlug(item.slug || ""),
      url: `/blog/${normalizeSlug(item.slug || "")}`,
    }));
  },

  async getTeamMember(slug) {
    const member =
      (await emdashFetch(`/team/${slug}`)) ||
      (await emdashFetch(`/team?slug=${slug}`));
    const m = Array.isArray(member) ? member[0] : member;
    if (!m) return null;
    return {
      name: m.name || "",
      slug: normalizeSlug(m.slug || slug),
      role: m.role || "",
      bio: m.bio || "",
      photo: mapEmDashImage(m.photo || m.avatar, m.name),
      email: m.email || "",
      website: m.website || "",
      linkedin: m.linkedin || "",
      twitter: m.twitter || "",
      github: m.github || "",
    };
  },

  async getTeamMembers() {
    const data = await emdashFetch(`/team`);
    if (!Array.isArray(data)) return [];
    return data.map((m: any) => ({
      name: m.name || "",
      slug: normalizeSlug(m.slug || ""),
      role: m.role || "",
      bio: m.bio || "",
      photo: mapEmDashImage(m.photo || m.avatar, m.name),
      email: m.email || "",
      website: m.website || "",
      linkedin: m.linkedin || "",
      twitter: m.twitter || "",
      github: m.github || "",
    }));
  },

  async getPostsByTeamMember(slug) {
    const data =
      (await emdashFetch(`/posts?author=${encodeURIComponent(slug)}`)) ||
      (await emdashFetch(`/posts/by-author/${encodeURIComponent(slug)}`));
    if (!Array.isArray(data)) return [];
    return data.map(mapEmDashPost).filter(Boolean) as any[];
  },

  async getPage(slug) {
    const safeSlug = normalizeSlug(slug);

    const page =
      (await emdashFetch(`/pages/${safeSlug}`)) ||
      (await emdashFetch(`/pages?slug=${safeSlug}`));

    return mapEmDashPage(Array.isArray(page) ? page[0] : page);
  },

  async getPosts() {
    const posts = await emdashFetch(`/posts`);

    return Array.isArray(posts)
      ? (posts.map(mapEmDashPost).filter(Boolean) as NormalizedPost[])
      : [];
  },

  async getPost(slug) {
    const safeSlug = normalizeSlug(slug);

    const post =
      (await emdashFetch(`/posts/${safeSlug}`)) ||
      (await emdashFetch(`/posts?slug=${safeSlug}`));

    return mapEmDashPost(Array.isArray(post) ? post[0] : post);
  },

  async getMenu(name: string) {
    const menu: RawEmDashMenu | undefined =
      (await emdashFetch(`/menus/${name}`)) ||
      (await emdashFetch(`/menus?name=${name}`));

    return mapEmDashMenu(Array.isArray(menu) ? menu[0] : menu, name);
  },

  async getSiteSettings(): Promise<NormalizedSiteSettings> {
    const settings = await emdashFetch(`/settings`);

    return {
      siteTitle: settings?.siteTitle || settings?.title || "KapiLabs",
      tagline: settings?.tagline || settings?.description || "",
      logo: mapEmDashImage(settings?.logo, settings?.siteTitle || "KapiLabs"),
      favicon: mapEmDashImage(settings?.favicon, "Favicon"),
      phone: settings?.phone || "",
      email: settings?.email || "",
      address: settings?.address || "",
      social: settings?.social || {},
      theme: settings?.theme || {},
      customCode: settings?.customCode || {},
    };
  },

  async getWidgets(): Promise<NormalizedWidget[]> {
    const widgets = await emdashFetch(`/widgets`);

    return Array.isArray(widgets)
      ? widgets.map((widget: any) => ({
          id: widget.id || widget._id,
          area: widget.area || widget.widgetArea || "sidebar",
          type: widget.type || "html",
          title: widget.title || "",
          content: widget.content || widget.html || "",
          menuName: widget.menuName || "",
          buttonLabel: widget.buttonLabel || "",
          buttonUrl: widget.buttonUrl || "",
        }))
      : [];
  },

  async getGlobalSections() {
    const sections = await emdashFetch(`/global-sections`);
    return Array.isArray(sections)
      ? sections.map((s: any) => ({
          title: s.title || "",
          key: s.key || "",
          sectionType: s.sectionType || "",
          content: s.content || {},
        }))
      : [];
  },

  async getGlobalSection(key: string) {
    const section =
      (await emdashFetch(`/global-sections/${key}`)) ||
      (await emdashFetch(`/global-sections?key=${key}`));
    const s = Array.isArray(section) ? section[0] : section;
    if (!s) return null;
    return {
      title: s.title || "",
      key: s.key || key,
      sectionType: s.sectionType || "",
      content: s.content || {},
    };
  },

  async getThemeSettings(): Promise<CmsThemeSettings> {
    const settings = await emdashFetch(`/theme-settings`);
    if (settings) {
      return {
        primaryColor: settings.primaryColor || "#111827",
        secondaryColor: settings.secondaryColor || "#2563eb",
        backgroundColor: settings.backgroundColor || "#ffffff",
        textColor: settings.textColor || "#111827",
        tokens: settings.tokens || {},
        typography: settings.typography || {},
        containerWidth: settings.containerWidth || "1200px",
        buttonStyle: settings.buttonStyle || "rounded",
        header: settings.header || {},
        footer: settings.footer || {},
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
    const data = await emdashFetch(`/forms`);
    if (!Array.isArray(data)) return [];
    return data.map((f: any) => ({
      id: f.id || f._id || "",
      title: f.title || "",
      formType: f.formType || "contact",
      successMessage: f.successMessage || "",
      emailTo: f.emailTo || "",
      fields: Array.isArray(f.fields)
        ? f.fields.map((field: any) => ({
            name: field.name || "",
            label: field.label || "",
            type: field.type || "text",
            placeholder: field.placeholder || "",
            required: Boolean(field.required),
            options: field.options || [],
          }))
        : [],
    }));
  },

  async getTaxonomies(type) {
    const results: any[] = [];
    if (!type || type === "category") {
      const cats = await emdashFetch(`/taxonomies/categories`);
      if (Array.isArray(cats)) {
        cats.forEach((c: any) => {
          results.push({
            id: c.id || c._id || "",
            name: c.name || "",
            slug: c.slug || "",
            count: c.count || 0,
            type: "category" as const,
          });
        });
      }
    }
    if (!type || type === "tag") {
      const tags = await emdashFetch(`/taxonomies/tags`);
      if (Array.isArray(tags)) {
        tags.forEach((t: any) => {
          results.push({
            id: t.id || t._id || "",
            name: t.name || "",
            slug: t.slug || "",
            count: t.count || 0,
            type: "tag" as const,
          });
        });
      }
    }
    return results;
  },

  async getSavedSection(slug: string) {
    const section = await emdashFetch(`/saved-sections/${slug}`);
    if (!section) return null;
    const s = Array.isArray(section) ? section[0] : section;
    return {
      id: s.id || s._id || "",
      title: s.title || "",
      slug: s.slug || slug,
      description: s.description || "",
      category: s.category || "",
      sectionType: s.sectionType || "",
      content: s.content || {},
      thumbnail: s.thumbnail ? { src: s.thumbnail } : undefined,
      version: s.version || 1,
      status: s.status || "draft",
    };
  },

  // ── Premium Content: Advanced Search ──────────────────────────────────────────

  async searchAdvanced(query, filter, options) {
    // Basic search fallback — EmDash does not support faceted search natively
    const results = await this.search(query, filter);
    return {
      results: results,
      total: results.length,
      facets: { types: [], categories: [], tags: [], dateRanges: [] },
      page: options?.page || 1,
      pageSize: options?.pageSize || 20,
    };
  },

  // ── Premium Content: Knowledge Base ───────────────────────────────────────────

  async getKnowledgeBaseCategories() {
    const data = await emdashFetch(`/knowledge-base/categories`);
    if (Array.isArray(data)) {
      return data.map((c: any) => ({
        id: c.id || c._id || "",
        title: c.title || "",
        slug: c.slug || "",
        description: c.description || "",
        icon: c.icon || "",
        order: c.order || 0,
        articleCount: c.count || 0,
      }));
    }
    return [];
  },

  async getKnowledgeBaseArticles(options) {
    let path = `/knowledge-base`;
    if (options?.categorySlug) path += `?category=${options.categorySlug}`;
    else if (options?.search) path += `?search=${encodeURIComponent(options.search)}`;
    const data = await emdashFetch(path);
    if (!Array.isArray(data)) return { articles: [], total: 0 };
    return {
      articles: data.map((a: any) => ({
        id: a.id || a._id || "",
        title: a.title || "",
        slug: a.slug || "",
        excerpt: a.excerpt || "",
        publishedAt: a.publishedAt || "",
        tags: a.tags || [],
        featured: Boolean(a.featured),
      })),
      total: data.length,
    };
  },

  async getKnowledgeBaseArticle(slug) {
    const article = await emdashFetch(`/knowledge-base/${encodeURIComponent(slug)}`);
    if (!article) return null;
    const a = Array.isArray(article) ? article[0] : article;
    return {
      id: a.id || a._id || "",
      title: a.title || "",
      slug: a.slug || slug,
      excerpt: a.excerpt || "",
      content: a.content || "",
      tags: a.tags || [],
      featured: Boolean(a.featured),
      publishedAt: a.publishedAt || "",
    };
  },

  async getKnowledgeBaseTree() {
    const cats = await emdashFetch(`/knowledge-base/categories`);
    return {
      categories: Array.isArray(cats) ? cats.map((c: any) => ({
        id: c.id || c._id || "",
        title: c.title || "",
        slug: c.slug || "",
        description: c.description || "",
        icon: c.icon || "",
        order: c.order || 0,
        articleCount: c.count || 0,
      })) : [],
      uncategorizedCount: 0,
    };
  },

  // ── Premium Marketing: Newsletter ─────────────────────────────────────────────

  async getNewsletterConfig() { return null; },

  async getSavedSections(options) {
    let path = `/saved-sections`;
    if (options?.category) path += `?category=${encodeURIComponent(options.category)}`;
    else if (options?.type) path += `?type=${encodeURIComponent(options.type)}`;
    const sections = await emdashFetch(path);
    if (!Array.isArray(sections)) return [];
    return sections.map((s: any) => ({
      id: s.id || s._id || "",
      title: s.title || "",
      slug: s.slug || "",
      description: s.description || "",
      category: s.category || "",
      sectionType: s.sectionType || "",
      content: s.content || {},
      thumbnail: s.thumbnail ? { src: s.thumbnail } : undefined,
      version: s.version || 1,
      status: s.status || "draft",
    }));
  },
};
