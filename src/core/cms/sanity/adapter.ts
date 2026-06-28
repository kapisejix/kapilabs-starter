import type {
  CmsAdapter,
  CmsForm,
  CmsNewsletterProvider,
  CmsSearchFilter,
  CmsSearchResult,
  CmsTaxonomy,
} from "../types";
import { sanityClient } from "./client";
import {
  globalSectionsQuery,
  menuByNameQuery,
  pageBySlugQuery,
  postBySlugQuery,
  postsByTeamMemberQuery,
  postsQuery,
  relatedPostsQuery,
  searchQuery,
  siteSettingsQuery,
  themeSettingsQuery,
  teamMemberBySlugQuery,
  teamMembersQuery,
  widgetsByAreaQuery,
} from "./queries";
import {
  mapSanityGlobalSection,
  mapSanityMenu,
  mapSanityPage,
  mapSanityPost,
  mapSanitySiteSettings,
  mapSanityTeamMember,
  mapSanityThemeSettings,
  mapSanityWidgets,
  mapPortableText,
} from "./mappers";
import type {
  RawSanityKbArticle,
  RawSanityKbCategory,
  RawSanitySearchItem,
  RawSanitySearchResults,
} from "./raw-types";

// ── Knowledge Base Queries ───────────────────────────────────────────────

const kbCategoriesQuery = `
  *[_type == "knowledgeBaseCategory"] | order(order asc){
    "id": _id,
    title,
    "slug": slug.current,
    description,
    icon,
    order,
    "parentId": parent->slug.current,
    "articleCount": count(*[_type == "knowledgeBaseArticle" && references(^._id)])
  }
`;

const kbArticleQuery = `
  *[_type == "knowledgeBaseArticle" && slug.current == $slug][0]{
    "id": _id,
    title,
    "slug": slug.current,
    excerpt,
    publishedAt,
    content[]{
      ...,
      _type == "image" => { ..., asset->{ url, metadata{ dimensions, lqip } } }
    },
    "category": category->{ "id": _id, title, "slug": slug.current, description },
    "categorySlug": category->slug.current,
    tags,
    featured,
    "author": author->{ name, "slug": slug.current, role, photo{ asset->{ url } } },
    seo,
    "relatedArticles": relatedArticles[]->{ title, "slug": slug.current }
  }
`;

export const sanityAdapter: CmsAdapter = {
  async search(query: string, filter?: CmsSearchFilter) {
    const result: RawSanitySearchResults | undefined = await sanityClient.fetch(
      searchQuery as unknown as string,
      { query } as Record<string, unknown>
    );

    const allResults: CmsSearchResult[] = [];
    const filterTypes = filter?.types;
    const allowedType = (type: string): boolean =>
      !filterTypes || filterTypes.length === 0 || filterTypes.includes(type as CmsSearchFilter["types"] extends (infer U)[] ? U : never);

    const mapItem = (
      item: RawSanitySearchItem,
      type: CmsSearchResult["type"],
      urlFn: (slug: string) => string
    ): CmsSearchResult => ({
      id: item._id || "",
      type,
      title: item.title || "",
      excerpt: item.excerpt || "",
      slug: item.slug || "",
      url: urlFn(item.slug || ""),
    });

    const slugToUrl: Record<string, (slug: string) => string> = {
      page: (slug) => (slug === "home" ? "/" : `/${slug}`),
      post: (slug) => `/blog/${slug}`,
      team: (slug) => (slug ? `/team/${slug}` : ""),
    };

    if (allowedType("page")) {
      const items = (result?.pages || []).map((p) => mapItem(p, "page", slugToUrl.page));
      allResults.push(...items);
    }
    if (allowedType("post")) {
      const items = (result?.posts || []).map((p) => mapItem(p, "post", slugToUrl.post));
      allResults.push(...items);
    }
    if (allowedType("team")) {
      const items = (result?.team || []).map((m) => mapItem(m, "team", slugToUrl.team));
      allResults.push(...items);
    }
    if (allowedType("testimonial")) {
      const items = (result?.testimonials || []).map((t) => ({
        id: t._id || "",
        type: "testimonial" as const,
        title: t.title || "Testimonial",
        excerpt: typeof t.excerpt === "string" ? t.excerpt.substring(0, 200) : "",
        slug: "",
        url: "",
      }));
      allResults.push(...items);
    }
    if (allowedType("service")) {
      const items = (result?.services || []).map((s) => ({
        id: s._id || "",
        type: "service" as const,
        title: s.title || "Service",
        excerpt: typeof s.excerpt === "string" ? s.excerpt.substring(0, 200) : "",
        slug: "",
        url: "",
      }));
      allResults.push(...items);
    }

    return allResults;
  },

  async getRelatedContent(input: {
    type: "post" | "page";
    slug: string;
    categories?: string[];
    tags?: string[];
    limit?: number;
  }) {
    if (input.type !== "post") return [];

    const posts = await sanityClient.fetch(
      relatedPostsQuery as unknown as string,
      {
        slug: input.slug,
        categories: input.categories || [],
        tags: input.tags || [],
        limit: input.limit || 3,
      }
    );

    return ((posts as RawSanitySearchItem[]) || []).map((post) => ({
      id: post._id || "",
      type: "post" as const,
      title: post.title || "",
      excerpt: post.excerpt || "",
      slug: post.slug || "",
      url: `/blog/${post.slug || ""}`,
    }));
  },

  async getTeamMember(slug: string) {
    const member = await sanityClient.fetch(
      teamMemberBySlugQuery as unknown as string,
      { slug } as Record<string, string>
    );

    return mapSanityTeamMember(member);
  },

  async getTeamMembers() {
    const members = await sanityClient.fetch(teamMembersQuery as unknown as string);

    return (members || []).map(mapSanityTeamMember).filter(Boolean);
  },

  async getPostsByTeamMember(slug: string) {
    const posts = await sanityClient.fetch(
      postsByTeamMemberQuery as unknown as string,
      { slug } as Record<string, string>
    );

    return (posts || []).map(mapSanityPost).filter(Boolean);
  },

  async getPage(slug: string) {
    const page = await sanityClient.fetch(pageBySlugQuery, { slug });
    return mapSanityPage(page);
  },

  async getPosts() {
    const posts = await sanityClient.fetch(postsQuery);
    return posts.map(mapSanityPost).filter(Boolean);
  },

  async getPost(slug: string) {
    const post = await sanityClient.fetch(postBySlugQuery, { slug });
    return mapSanityPost(post);
  },

  async getMenu(name: string) {
    const menu = await sanityClient.fetch(menuByNameQuery, { name });
    return mapSanityMenu(menu);
  },

  async getSiteSettings() {
    const [settings, theme] = await Promise.all([
      sanityClient.fetch(siteSettingsQuery),
      sanityClient.fetch(themeSettingsQuery),
    ]);
    const mapped = mapSanitySiteSettings(settings);
    mapped.theme = mapSanityThemeSettings(theme);
    return mapped;
  },

  async getThemeSettings() {
    const theme = await sanityClient.fetch(themeSettingsQuery);
    return mapSanityThemeSettings(theme);
  },

  async getWidgets(area: string) {
    const widgets = await sanityClient.fetch(widgetsByAreaQuery, { area });
    return mapSanityWidgets(widgets);
  },

  async getGlobalSections() {
    const sections = await sanityClient.fetch(globalSectionsQuery);
    return (sections || []).map(mapSanityGlobalSection).filter(Boolean);
  },

  async getGlobalSection(key: string) {
    const query = `*[_type == "globalSection" && key == $key][0]{ title, key, sectionType, content }`;
    return mapSanityGlobalSection(await sanityClient.fetch(query, { key }));
  },

  async getForms() {
    const query = `*[_type == "form"]{ _id, title, formType, successMessage, emailTo, fields }`;
    type RawFormResponse = {
      _id?: string;
      title?: string;
      formType?: string;
      successMessage?: string;
      emailTo?: string;
      fields?: CmsForm["fields"];
    };
    const forms = await sanityClient.fetch(query);
    return ((forms || []) as RawFormResponse[]).map((f) => ({
      id: f._id || "",
      title: f.title || "",
      formType: f.formType || "",
      successMessage: f.successMessage || "",
      emailTo: f.emailTo || "",
      fields: f.fields || [],
    }));
  },

  async getTaxonomies(type?: "category" | "tag") {
    const results: CmsTaxonomy[] = [];

    if (!type || type === "category") {
      const raw: { name?: string[] }[] = await sanityClient.fetch(
        `*[_type == "post" && defined(categories)]{"name": categories[]}`
      );
      const allCats = [...new Set((raw || []).flatMap((p) => p.name || []))];
      allCats.forEach((name, i) => {
        results.push({
          id: `cat-${i}`,
          name: String(name),
          slug: String(name).toLowerCase().replace(/\s+/g, "-"),
          type: "category" as const,
        });
      });
    }

    if (!type || type === "tag") {
      const raw: { name?: string[] }[] = await sanityClient.fetch(
        `*[_type == "post" && defined(tags)]{"name": tags[]}`
      );
      const allTags = [...new Set((raw || []).flatMap((p) => p.name || []))];
      allTags.forEach((name, i) => {
        results.push({
          id: `tag-${i}`,
          name: String(name),
          slug: String(name).toLowerCase().replace(/\s+/g, "-"),
          type: "tag" as const,
        });
      });
    }

    return results;
  },

  // ── Advanced Search ──────────────────────────────────────────────────────────

  async searchAdvanced(
    query: string,
    filter?: CmsSearchFilter,
    options?: { page?: number; pageSize?: number }
  ) {
    const { buildSearchFilter, buildSortExpression, paginateResults, extractFacets } = await import("../../search/advancedSearch");

    const { primaryFilter, params } = buildSearchFilter(query, filter);
    const sortExpr = buildSortExpression(filter?.sort);
    const page = options?.page || 1;
    const pageSize = options?.pageSize || 20;

    // Run queries in parallel for results and counts
    const [pages, posts, team, testimonials, services] = await Promise.all([
      sanityClient.fetch(
        `*[_type == "page" && ${primaryFilter}] | order(${sortExpr}){
          _id, title, "slug": slug.current
        }`,
        params
      ),
      sanityClient.fetch(
        `*[_type == "post" && ${primaryFilter}] | order(${sortExpr}){
          _id, title, excerpt, "slug": slug.current, categories, tags, publishedAt
        }`,
        params
      ),
      sanityClient.fetch(
        `*[_type == "teamMember" && (name match $searchPattern || role match $searchPattern)]{
          _id, "title": name, "slug": slug.current, "excerpt": role
        }`,
        params
      ),
      sanityClient.fetch(
        `*[_type == "globalSection" && sectionType == "testimonials" && title match $searchPattern]{ _id, title }`,
        params
      ),
      sanityClient.fetch(
        `*[_type == "globalSection" && sectionType == "services" && title match $searchPattern]{ _id, title }`,
        params
      ),
    ]);

    const filterTypes = filter?.types;
    const allowed = (type: string) =>
      !filterTypes || filterTypes.length === 0 || filterTypes.includes(type as CmsSearchFilter["types"] extends (infer U)[] ? U : never);

    const allResults: CmsSearchResult[] = [];
    const typeCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};
    const tagCounts: Record<string, number> = {};

    type RawAdvancedItem = {
      _id?: string;
      title?: string;
      slug?: string;
      excerpt?: string;
      categories?: string[];
      tags?: string[];
      publishedAt?: string;
    };

    const mapResult = (type: string, item: RawAdvancedItem) => {
      typeCounts[type] = (typeCounts[type] || 0) + 1;
      if (item.categories) {
        item.categories.forEach((c) => {
          categoryCounts[c] = (categoryCounts[c] || 0) + 1;
        });
      }
      if (item.tags) {
        item.tags.forEach((t) => {
          tagCounts[t] = (tagCounts[t] || 0) + 1;
        });
      }
      return {
        id: item._id || "",
        type: type as CmsSearchResult["type"],
        title: item.title || "",
        excerpt: item.excerpt || "",
        slug: item.slug || "",
        url: type === "page" ? (item.slug === "home" ? "/" : `/${item.slug}`) : type === "post" ? `/blog/${item.slug}` : type === "team" ? `/team/${item.slug}` : "",
      };
    };

    if (allowed("page")) allResults.push(...((pages || []) as RawAdvancedItem[]).map((p) => mapResult("page", p)));
    if (allowed("post")) allResults.push(...((posts || []) as RawAdvancedItem[]).map((p) => mapResult("post", p)));
    if (allowed("team")) allResults.push(...((team || []) as RawAdvancedItem[]).map((t) => mapResult("team", t)));
    if (allowed("testimonial")) allResults.push(...((testimonials || []) as RawAdvancedItem[]).map((t) => mapResult("testimonial", t)));
    if (allowed("service")) allResults.push(...((services || []) as RawAdvancedItem[]).map((s) => mapResult("service", s)));

    // Build date facet counts
    const now = new Date();
    const rawPosts = (posts || []) as RawAdvancedItem[];
    const dateCounts = [
      { label: "Past 30 Days", from: new Date(now.getTime() - 30 * 86400000).toISOString(), to: now.toISOString(), count: rawPosts.filter((p) => p.publishedAt && new Date(p.publishedAt) > new Date(now.getTime() - 30 * 86400000)).length },
      { label: "Past 3 Months", from: new Date(now.getTime() - 90 * 86400000).toISOString(), to: now.toISOString(), count: rawPosts.filter((p) => p.publishedAt && new Date(p.publishedAt) > new Date(now.getTime() - 90 * 86400000)).length },
      { label: "Past Year", from: new Date(now.getTime() - 365 * 86400000).toISOString(), to: now.toISOString(), count: rawPosts.filter((p) => p.publishedAt && new Date(p.publishedAt) > new Date(now.getTime() - 365 * 86400000)).length },
    ];

    const { items, total, page: p, pageSize: ps } = paginateResults(allResults, page, pageSize);

    return {
      results: items,
      total,
      facets: extractFacets(items, typeCounts, categoryCounts, tagCounts, dateCounts),
      page: p,
      pageSize: ps,
    };
  },

  // ── Knowledge Base ────────────────────────────────────────────────────────────

  async getKnowledgeBaseCategories() {
    const categories = await sanityClient.fetch(kbCategoriesQuery as unknown as string);
    return ((categories || []) as RawSanityKbCategory[]).map((cat) => ({
      id: cat.id || "",
      title: cat.title || "",
      slug: cat.slug || "",
      description: cat.description || "",
      icon: cat.icon || "",
      order: cat.order || 0,
      parentId: cat.parentId || undefined,
      articleCount: cat.articleCount || 0,
    }));
  },

  async getKnowledgeBaseArticles(options?: {
    categorySlug?: string;
    tag?: string;
    featured?: boolean;
    search?: string;
    page?: number;
    pageSize?: number;
  }) {
    let filter = `*[_type == "knowledgeBaseArticle"]`;
    const conditions: string[] = [];
    const params: Record<string, unknown> = {};

    if (options?.categorySlug) {
      conditions.push(`category->slug.current == $categorySlug`);
      params.categorySlug = options.categorySlug;
    }
    if (options?.featured) {
      conditions.push(`featured == true`);
    }
    if (options?.search) {
      conditions.push(`title match $searchPattern`);
      params.searchPattern = `*${options.search}*`;
    }

    if (conditions.length > 0) {
      filter += `[${conditions.join(" && ")}]`;
    }

    filter += ` | order(featured desc, publishedAt desc)`;

    const query = `${filter}{
      "id": _id,
      title,
      "slug": slug.current,
      excerpt,
      publishedAt,
      "category": category->{ title, "slug": slug.current },
      "categorySlug": category->slug.current,
      tags,
      featured
    }`;

    const allArticles = await sanityClient.fetch(query, params);
    const total = ((allArticles || []) as unknown[]).length;

    const pageSize = options?.pageSize || 20;
    const page = options?.page || 1;
    const start = (page - 1) * pageSize;
    const sliced = ((allArticles || []) as RawSanityKbArticle[]).slice(start, start + pageSize);

    return {
      articles: sliced.map((a) => ({
        id: a.id || "",
        title: a.title || "",
        slug: a.slug || "",
        excerpt: a.excerpt || "",
        publishedAt: a.publishedAt || "",
        category: a.category as any,
        categorySlug: a.categorySlug || "",
        tags: a.tags || [],
        featured: Boolean(a.featured),
      })),
      total,
    };
  },

  async getKnowledgeBaseArticle(slug: string) {
    const article = await sanityClient.fetch(kbArticleQuery, { slug }) as RawSanityKbArticle | undefined;
    if (!article) return null;

    return {
      id: article.id || "",
      title: article.title || "",
      slug: article.slug || slug,
      excerpt: article.excerpt || "",
      publishedAt: article.publishedAt || "",
      content: mapPortableText(article.content),
      category: article.category as any,
      categorySlug: article.categorySlug || "",
      tags: article.tags || [],
      featured: Boolean(article.featured),
      author: article.author as any,
      seo: article.seo as any,
      relatedArticles: (article.relatedArticles || []).map((r) => ({
        title: r.title || "",
        slug: r.slug || "",
      })),
    };
  },

  async getKnowledgeBaseTree() {
    const categories = await this.getKnowledgeBaseCategories();
    await this.getKnowledgeBaseArticles({ pageSize: 1 });

    // Build tree structure
    const topLevel = categories.filter((c) => !c.parentId);
    const children = categories.filter((c) => c.parentId);

    const tree = topLevel.map((cat) => ({
      ...cat,
      children: children.filter((c) => c.parentId === cat.slug),
    }));

    // Count uncategorized (articles with no category)
    const allArticles: unknown[] = await sanityClient.fetch(
      `*[_type == "knowledgeBaseArticle" && !defined(category->slug.current)]{ _id }`
    );

    return { categories: tree, uncategorizedCount: (allArticles || []).length };
  },

  // ── Newsletter ────────────────────────────────────────────────────────────────

  async getNewsletterConfig() {
    const provider = (
      (typeof process !== "undefined" ? process.env.NEWSLETTER_PROVIDER : undefined) ||
      ""
    ).toLowerCase() as CmsNewsletterProvider | "";

    if (!provider) return null;

    return {
      provider: provider as CmsNewsletterProvider,
      apiKey: "", // Not exposed in public config
      listId: typeof process !== "undefined" ? process.env.MAILCHIMP_LIST_ID : undefined,
      apiServer: typeof process !== "undefined" ? process.env.MAILCHIMP_SERVER : undefined,
      doubleOptin: true,
    };
  },

  async getSavedSection(slug: string) {
    const query = `*[_type == "savedSection" && slug.current == $slug][0]{
      "id": _id,
      title,
      "slug": slug.current,
      description,
      category,
      sectionType,
      content,
      thumbnail{ asset->{ url } },
      version,
      status
    }`;
    type RawSavedSection = {
      id?: string;
      title?: string;
      slug?: string;
      description?: string;
      category?: string;
      sectionType?: string;
      content?: Record<string, unknown>;
      thumbnail?: { asset?: { url?: string } };
      version?: number;
      status?: string;
    };
    const section = await sanityClient.fetch(query, { slug }) as RawSavedSection | undefined;
    if (!section) return null;
    return {
      id: section.id || "",
      title: section.title || "",
      slug: section.slug || slug,
      description: section.description,
      category: section.category,
      sectionType: section.sectionType || "",
      content: section.content || {},
      thumbnail: section.thumbnail?.asset?.url ? { src: section.thumbnail.asset.url } : undefined,
      version: section.version || 1,
      status: section.status as "draft" | "published" | "archived" | undefined,
    };
  },

  async getSavedSections(options?: { category?: string; type?: string }) {
    let filter = `*[_type == "savedSection"]`;
    const queryParams: Record<string, string> = {};
    if (options?.category) {
      filter += `[category == $category]`;
      queryParams.category = options.category;
    }
    if (options?.type) {
      filter += `[sectionType == $type]`;
      queryParams.type = options.type;
    }
    filter += ` | order(title asc)`;

    type RawSavedSection = {
      id?: string;
      title?: string;
      slug?: string;
      description?: string;
      category?: string;
      sectionType?: string;
      content?: Record<string, unknown>;
      thumbnail?: { asset?: { url?: string } };
      version?: number;
      status?: string;
    };

    const sections = await sanityClient.fetch(
      filter + `{
        "id": _id,
        title,
        "slug": slug.current,
        description,
        category,
        sectionType,
        content,
        thumbnail{ asset->{ url } },
        version,
        status
      }`,
      queryParams
    ) as RawSavedSection[];

    return ((sections || []) as RawSavedSection[]).map((s) => ({
      id: s.id || "",
      title: s.title || "",
      slug: s.slug || "",
      description: s.description,
      category: s.category,
      sectionType: s.sectionType || "",
      content: s.content || {},
      thumbnail: s.thumbnail?.asset?.url ? { src: s.thumbnail.asset.url } : undefined,
      version: s.version || 1,
      status: s.status as "draft" | "published" | "archived" | undefined,
    }));
  },
};
