export type CmsImage = {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  caption?: string;
  credit?: string;
  photographer?: string;
  copyright?: string;
  title?: string;
  description?: string;
  category?: string;
  tags?: string[];
  focalPoint?: {
    x?: number;
    y?: number;
  };
  lqip?: string;
};

export type CmsImageVariant = "thumbnail" | "medium" | "large" | "hero" | "og" | "twitter" | "square";

export type CmsImageVariantConfig = {
  width: number;
  height: number;
  fit: "crop" | "max" | "min";
  format?: "webp" | "avif";
};

export type CmsImageLike = CmsImage | string | null;

export type CmsCustomCode = {
  customCss?: string;
  headerScripts?: string;
  footerScripts?: string;
};

export type CmsGlobalCustomCode = {
  globalCss?: string;
  globalHeaderScripts?: string;
  globalFooterScripts?: string;
};

export type CmsSeo = {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  noindex?: boolean;
  nofollow?: boolean;
  image?: CmsImageLike;
  ogType?: "website" | "article";
  twitterCard?: "summary" | "summary_large_image";
  focusKeyword?: string;
  breadcrumbTitle?: string;
  ogTitle?: string;
  ogDescription?: string;
};

export type RichContentBlock =
  | { type: "paragraph"; html: string }
  | { type: "heading"; level: 1 | 2 | 3 | 4 | 5 | 6; html: string }
  | { type: "blockquote"; html: string }
  | { type: "list"; listType: "bullet" | "number"; items: string[]; level?: number }
  | { type: "image"; image: CmsImage; caption?: string }
  | { type: "code"; code: string; language?: string }
  | { type: "shortcode"; html: string }
  | { type: "table"; head?: string[]; rows: string[][]; caption?: string }
  | { type: "video"; url: string; title?: string; provider?: "youtube" | "vimeo" | "custom"; width?: string; height?: string }
  | { type: "columns"; columns: { html: string; width?: string }[]; gap?: string }
  | { type: "callout"; variant?: "info" | "warning" | "success" | "danger"; html: string; title?: string }
  | { type: "button"; label: string; url: string; variant?: "primary" | "secondary" | "outline"; targetBlank?: boolean }
  | { type: "sectionRef"; sectionKey: string; sectionTitle: string; sections: NormalizedSection[] };

export type RichContent = RichContentBlock[];

export type DisplayPreset =
  | "grid"
  | "list"
  | "carousel"
  | "masonry"
  | "tabs"
  | "accordion"
  | "timeline"
  | "cards"
  | "minimal"
  | "slider"
  | "scroll"
  | "stack";

export type SectionAnimation =
  | "fadeIn"
  | "fadeInUp"
  | "fadeInDown"
  | "slideInLeft"
  | "slideInRight"
  | "zoomIn"
  | "none";

export type SectionSettings = {
  /** Number of grid columns */
  columns?: number;
  /** Number of grid rows */
  rows?: number;
  /** Gap between items */
  spacing?: string;
  /** Container width override */
  containerWidth?: string;
  /** Section background color */
  background?: string;
  /** Section padding */
  padding?: string;
  /** Content alignment */
  alignment?: "left" | "center" | "right";
  /** Entrance animation */
  animation?: SectionAnimation;
  /** Icon display style */
  iconStyle?: "default" | "rounded" | "outlined" | "filled";
  /** Button style override */
  buttonStyle?: "solid" | "outline" | "ghost";
  /** Card style */
  cardStyle?: "default" | "bordered" | "elevated" | "flat" | "gradient";
  /** Border radius */
  borderRadius?: string;
  /** Box shadow */
  shadow?: string;
  /** Overlay color (for hero/banner sections) */
  overlay?: string;
  /** Display preset */
  displayPreset?: DisplayPreset;
  /** CSS class name */
  cssClass?: string;
  /** Section ID for anchor linking */
  sectionId?: string;
  /** Whether to hide the section title */
  hideTitle?: boolean;
  /** Maximum items to show */
  limit?: number;
};

export type NormalizedSection = Record<string, any> & {
  settings?: SectionSettings;
  query?: SectionQuery;
};

export type SectionQuery = {
  contentType: "post" | "team" | "testimonial" | "service" | "caseStudy";
  filter?: {
    category?: string;
    tag?: string;
    author?: string;
    featured?: boolean;
    manual?: string[]; // slug array
  };
  orderBy?: "date" | "popularity" | "random" | "manual";
  limit?: number;
};

export type CmsBanner = {
  eyebrow?: string;
  heading?: string;
  text?: string;
  image?: CmsImageLike;
  overlay?: boolean;
  alignment?: "left" | "center" | "right";
};

export type CmsTeamMember = {
  name: string;
  slug: string;
  role?: string;
  bio?: string;
  photo?: CmsImageLike;
  email?: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  github?: string;
};

export type CmsPageVisibility = {
  hideHeader?: boolean;
  hideFooter?: boolean;
  hideSidebar?: boolean;
  hideTitle?: boolean;
  hideBreadcrumbs?: boolean;
  hideFeaturedImage?: boolean;
};

export type CmsLayoutOverride = {
  containerWidth?: string;
  contentWidth?: string;
  sidebarWidth?: string;
  sidebarSticky?: boolean;
  gap?: string;
  padding?: string;
  background?: string;
};

export type CmsPage = {
  title: string;
  slug: string;
  template?: string;
  layout?: string;
  featuredImage?: CmsImageLike;
  banner?: CmsBanner;
  bannerImage?: CmsImageLike;
  content?: RichContent | string;
  contentMode?: "rich" | "html" | "code";
  seo?: CmsSeo;
  sections?: NormalizedSection[];
  customCode?: CmsCustomCode;
  visibility?: CmsPageVisibility;
  layoutOverride?: CmsLayoutOverride;
  customBodyClass?: string;
  animation?: string;
  anchorId?: string;
  themePreset?: string;
};

export type CmsPost = {
  title: string;
  slug: string;
  excerpt?: string;
  publishedAt?: string;
  categories?: string[];
  tags?: string[];
  featuredImage?: CmsImageLike;
  archiveImage?: CmsImageLike;
  ogImage?: CmsImageLike;
  banner?: CmsBanner;
  content?: RichContent | string;
  seo?: CmsSeo;
  customCode?: CmsCustomCode;
  author?: CmsTeamMember;
  visibility?: CmsPageVisibility;
  customBodyClass?: string;
  themePreset?: string;
};

export type CmsMenuItemType =
  | "custom"
  | "page"
  | "post"
  | "teamMember"
  | "category"
  | "tag"
  | "button"
  | "anchor"
  | "section";

export type CmsMenuItem = {
  label: string;
  url: string;
  type?: CmsMenuItemType;
  description?: string;
  icon?: string;
  cssClass?: string;
  targetBlank?: boolean;
  isMegaMenu?: boolean;
  megaMenuColumns?: number;
  badge?: string;
  nofollow?: boolean;
  animation?: string;
  visibility?: "visible" | "hidden" | "logged-in" | "logged-out";
  sectionSlug?: string;
  children?: CmsMenuItem[];
};

export type CmsMenuLocation =
  | "primary"
  | "secondary"
  | "footer"
  | "mobile"
  | "utility"
  | "top-bar"
  | "social"
  | "legal"
  | "sidebar"
  | "off-canvas"
  | "after-footer"
  | "blog-sidebar"
  | "page-sidebar";

export type CmsMenu = {
  name: string;
  location?: CmsMenuLocation;
  schemaVersion?: number;
  items: CmsMenuItem[];
};

export type CmsDesignTokens = {
  colors?: {
    primary?: string;
    secondary?: string;
    background?: string;
    text?: string;
    muted?: string;
    border?: string;
    softBackground?: string;
    accent?: string;
    surface?: string;
    link?: string;
    button?: string;
  };
  spacing?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    xxl?: string;
  };
  radius?: {
    sm?: string;
    md?: string;
    lg?: string;
    full?: string;
  };
  containerWidth?: string;
  breakpoints?: {
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };
  dark?: {
    primary?: string;
    secondary?: string;
    background?: string;
    text?: string;
    muted?: string;
    border?: string;
    surface?: string;
  };
};

export type CmsTypographyScale = {
  fontFamily?: string;
  headingFontFamily?: string;
  baseSize?: string;
  scale?: string;
  lineHeight?: string;
  headingLineHeight?: string;
  letterSpacing?: string;
  fontWeight?: string;
  headingFontWeight?: string;
};

export type CmsBlogSettings = {
  showAuthor?: boolean;
  showDate?: boolean;
  showCategories?: boolean;
  readingTime?: boolean;
  excerptLength?: number;
  postsPerPage?: number;
};

export type CmsThemeSettings = {
  tokens?: CmsDesignTokens;
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  typography?: CmsTypographyScale;
  containerWidth?: string;
  buttonStyle?: "rounded" | "pill" | "square";
  buttonRadius?: string;
  header?: {
    sticky?: boolean;
    transparent?: boolean;
    showSearch?: boolean;
    mobileMenuLabel?: string;
    showTopBar?: boolean;
    showCta?: boolean;
    ctaLabel?: string;
    ctaUrl?: string;
  };
  footer?: {
    showFooterWidgets?: boolean;
    copyrightText?: string;
    footerCta?: {
      label?: string;
      url?: string;
    };
    socialLinks?: {
      platform?: string;
      url?: string;
    }[];
  };
  blog?: CmsBlogSettings;
};

export type CmsSiteSettings = {
  siteTitle: string;
  tagline?: string;
  locale?: string;
  theme?: CmsThemeSettings;
  logo?: CmsImageLike;
  darkLogo?: CmsImageLike;
  favicon?: CmsImageLike;
  phone?: string;
  email?: string;
  address?: string;
  social?: Record<string, unknown>;
  customCode?: CmsGlobalCustomCode;
};

export type CmsWidget = {
  id?: string;
  area?: string;
  type?: string;
  title?: string;
  content?: unknown;
  menuName?: string;
  buttonLabel?: string;
  buttonUrl?: string;
  order?: number;
};

export type CmsGlobalSection = {
  title: string;
  key: string;
  sectionType: string;
  content: Record<string, any>;
};

export type CmsForm = {
  id?: string;
  title: string;
  formType?: string;
  successMessage?: string;
  emailTo?: string;
  fields?: {
    name: string;
    label: string;
    type: string;
    placeholder?: string;
    required?: boolean;
    options?: string[];
  }[];
};

export type CmsTaxonomy = {
  id: string;
  name: string;
  slug: string;
  count?: number;
  type?: "category" | "tag";
};

export type CmsSavedSection = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  category?: string;
  sectionType: string;
  content: Record<string, any>;
  thumbnail?: CmsImageLike;
  version?: number;
  status?: "draft" | "published" | "archived";
};

export type CmsSearchResult = {
  id: string;
  type: "page" | "post" | "team" | "testimonial" | "service" | "faq";
  title: string;
  excerpt?: string;
  slug: string;
  url: string;
  image?: CmsImageLike;
};

export type CmsSearchFilter = {
  types?: ("page" | "post" | "team" | "testimonial" | "service" | "faq")[];
  category?: string;
  tag?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: "relevance" | "date-desc" | "date-asc" | "title-asc" | "title-desc";
};

export type CmsSearchFacets = {
  categories: { name: string; count: number }[];
  tags: { name: string; count: number }[];
  types: { name: string; count: number }[];
  dateRanges: { label: string; from?: string; to?: string; count: number }[];
};

export type CmsSearchResponse = {
  results: CmsSearchResult[];
  total: number;
  facets: CmsSearchFacets;
  page: number;
  pageSize: number;
};

export type CmsArchiveSettings = {
  title?: string;
  description?: string;
  layout?: string;
  sidebar?: string;
  showBanner?: boolean;
  banner?: CmsBanner;
  postsPerPage?: number;
  seo?: CmsSeo;
};

// ─── Knowledge Base Types ─────────────────────────────────────────────────────

export type CmsKnowledgeBaseCategory = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  icon?: string;
  order?: number;
  parentId?: string;
  articleCount?: number;
  children?: CmsKnowledgeBaseCategory[];
};

export type CmsKnowledgeBaseArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: RichContent | string;
  category?: CmsKnowledgeBaseCategory;
  categorySlug?: string;
  tags?: string[];
  publishedAt?: string;
  updatedAt?: string;
  featured?: boolean;
  author?: CmsTeamMember;
  seo?: CmsSeo;
  relatedArticles?: { title: string; slug: string }[];
};

export type CmsKnowledgeBaseTree = {
  categories: CmsKnowledgeBaseCategory[];
  uncategorizedCount: number;
};

// ─── Newsletter Types ─────────────────────────────────────────────────────────

export type CmsNewsletterProvider = "mailchimp" | "convertkit" | "custom";

export type CmsNewsletterConfig = {
  provider: CmsNewsletterProvider;
  apiKey?: string;
  listId?: string;
  apiServer?: string; // e.g., "us12" for Mailchimp
  endpointUrl?: string; // custom endpoint
  doubleOptin?: boolean;
  tags?: string[];
};

// ─── CSP Types ────────────────────────────────────────────────────────────────

export type CspDirectiveValue = string | string[] | boolean;

export type CspConfig = {
  "default-src"?: CspDirectiveValue;
  "script-src"?: CspDirectiveValue;
  "style-src"?: CspDirectiveValue;
  "img-src"?: CspDirectiveValue;
  "connect-src"?: CspDirectiveValue;
  "font-src"?: CspDirectiveValue;
  "frame-src"?: CspDirectiveValue;
  "media-src"?: CspDirectiveValue;
  "object-src"?: CspDirectiveValue;
  "base-uri"?: CspDirectiveValue;
  "form-action"?: CspDirectiveValue;
  "worker-src"?: CspDirectiveValue;
  "manifest-src"?: CspDirectiveValue;
  "report-uri"?: string;
  "report-to"?: string;
};

export type SecurityConfig = {
  csp: CspConfig;
  hsts: {
    enabled: boolean;
    maxAge: number;
    includeSubDomains: boolean;
    preload: boolean;
  };
  csrfProtection: boolean;
  corsOrigins?: string[];
};

export type CmsRelatedContent = {
  id: string;
  type: "post" | "page";
  title: string;
  excerpt?: string;
  slug: string;
  url: string;
};

export type CmsAdapter = {
  search: (query: string, filter?: CmsSearchFilter) => Promise<CmsSearchResult[]>;
  getRelatedContent: (input: {
    type: "post" | "page";
    slug: string;
    categories?: string[];
    tags?: string[];
    limit?: number;
  }) => Promise<CmsRelatedContent[]>;
  getTeamMember: (slug: string) => Promise<CmsTeamMember | null>;
  getTeamMembers: () => Promise<CmsTeamMember[]>;
  getPostsByTeamMember: (slug: string) => Promise<CmsPost[]>;
  getPage: (slug: string) => Promise<CmsPage | null>;
  getPost: (slug: string) => Promise<CmsPost | null>;
  getPosts: () => Promise<CmsPost[]>;
  getMenu: (name: string) => Promise<CmsMenu | null>;
  getSiteSettings: () => Promise<CmsSiteSettings>;
  getThemeSettings: () => Promise<CmsThemeSettings>;
  getWidgets: (area: string) => Promise<CmsWidget[]>;
  getGlobalSections: () => Promise<CmsGlobalSection[]>;
  getGlobalSection: (key: string) => Promise<CmsGlobalSection | null>;
  getForms: () => Promise<CmsForm[]>;
  getTaxonomies: (type?: "category" | "tag") => Promise<CmsTaxonomy[]>;
  getSavedSection: (slug: string) => Promise<CmsSavedSection | null>;
  getSavedSections: (options?: { category?: string; type?: string }) => Promise<CmsSavedSection[]>;

  // ── Premium Content: Advanced Search ──────────────────────────────────────────
  searchAdvanced: (
    query: string,
    filter?: CmsSearchFilter,
    options?: { page?: number; pageSize?: number }
  ) => Promise<CmsSearchResponse>;

  // ── Premium Content: Knowledge Base ───────────────────────────────────────────
  getKnowledgeBaseCategories: () => Promise<CmsKnowledgeBaseCategory[]>;
  getKnowledgeBaseArticles: (options?: {
    categorySlug?: string;
    tag?: string;
    featured?: boolean;
    search?: string;
    page?: number;
    pageSize?: number;
  }) => Promise<{ articles: CmsKnowledgeBaseArticle[]; total: number }>;
  getKnowledgeBaseArticle: (slug: string) => Promise<CmsKnowledgeBaseArticle | null>;
  getKnowledgeBaseTree: () => Promise<CmsKnowledgeBaseTree>;

  // ── Premium Marketing: Newsletter ─────────────────────────────────────────────
  getNewsletterConfig: () => Promise<CmsNewsletterConfig | null>;
};

export type NormalizedPage = CmsPage;
export type NormalizedPost = CmsPost;
export type NormalizedMenu = CmsMenu;
export type NormalizedSiteSettings = CmsSiteSettings;
export type NormalizedThemeSettings = CmsThemeSettings;
export type NormalizedWidget = CmsWidget;
export type NormalizedGlobalSection = CmsGlobalSection;
