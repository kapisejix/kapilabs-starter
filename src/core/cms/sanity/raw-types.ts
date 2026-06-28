/**
 * Raw Sanity API response types.
 *
 * These types describe the shape of data returned by the GROQ queries
 * defined in queries.ts. They are the boundary types at which Sanity's
 * unstructured JSON responses become typed data.
 */

// ─── Asset / Image ───────────────────────────────────────────────────────

export interface RawSanityImageAsset {
  _id?: string;
  url?: string;
  metadata?: {
    dimensions?: {
      width?: number;
      height?: number;
      aspectRatio?: number;
    };
    lqip?: string;
  };
}

export interface RawSanityImage {
  _type?: "image";
  asset?: RawSanityImageAsset;
  alt?: string;
  caption?: string;
  credit?: string;
  photographer?: string;
  copyright?: string;
  title?: string;
  description?: string;
  hotspot?: {
    x: number;
    y: number;
  };
}

// ─── Rich Text / Portable Text ───────────────────────────────────────────

export interface RawSanityMarkDef {
  _key: string;
  _type: string;
  href?: string;
  blank?: boolean;
}

export interface RawSanitySpan {
  _type: "span";
  text?: string;
  marks?: string[];
}

export interface RawSanityBlock {
  _type: "block";
  _key?: string;
  style?: string;
  children?: RawSanitySpan[];
  markDefs?: RawSanityMarkDef[];
  level?: number;
  listItem?: "bullet" | "number";
  code?: string;
  language?: string;
}

export interface RawSanityImageBlock {
  _type: "image";
  asset?: RawSanityImageAsset;
  alt?: string;
  caption?: string;
  hotspot?: { x: number; y: number };
}

export interface RawSanityShortcodeBlock {
  _type: "shortcode";
  name?: string;
  attrs?: string;
}

export interface RawSanityCodeBlock {
  _type: "codeBlock";
  code?: string;
  language?: string;
}

export interface RawSanitySectionRefBlock {
  _type: "sectionRef";
  section?: RawSanityGlobalSectionRef;
}

export interface RawSanityGlobalSectionRef {
  title?: string;
  key?: string;
  sectionType?: string;
  content?: Record<string, unknown>;
  sections?: RawSanitySection[];
}

export type RawSanityBlockContent =
  | RawSanityBlock
  | RawSanityImageBlock
  | RawSanityShortcodeBlock
  | RawSanityCodeBlock
  | RawSanitySectionRefBlock;

// ─── Menu ────────────────────────────────────────────────────────────────

export interface RawSanityMenuItem {
  label?: string;
  url?: string;
  itemType?: string;
  description?: string;
  icon?: string;
  cssClass?: string;
  targetBlank?: boolean;
  isMegaMenu?: boolean;
  megaMenuColumns?: number;
  badge?: string;
  nofollow?: boolean;
  animation?: string;
  visibility?: string;
  slug?: string;
  sectionSlug?: string;
  page?: { title?: string; slug?: string };
  post?: { title?: string; slug?: string };
  teamMember?: { name?: string; slug?: string };
  category?: string;
  tag?: string;
  children?: RawSanityMenuItem[];
}

export interface RawSanityMenu {
  name?: string;
  location?: string;
  schemaVersion?: number;
  items?: RawSanityMenuItem[];
}

// ─── Banner ──────────────────────────────────────────────────────────────

export interface RawSanityBanner {
  eyebrow?: string;
  heading?: string;
  text?: string;
  overlay?: boolean;
  alignment?: string;
  image?: RawSanityImage;
}

// ─── SEO ─────────────────────────────────────────────────────────────────

export interface RawSanitySeo {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  noindex?: boolean;
  nofollow?: boolean;
  image?: RawSanityImage | string;
  ogType?: string;
  twitterCard?: string;
  focusKeyword?: string;
  breadcrumbTitle?: string;
  ogTitle?: string;
  ogDescription?: string;
}

// ─── Page ────────────────────────────────────────────────────────────────

export interface RawSanityPage {
  title?: string;
  slug?: string;
  template?: string;
  layout?: string;
  contentMode?: string;
  featuredImage?: RawSanityImage;
  seoImage?: RawSanityImage;
  banner?: RawSanityBanner;
  content?: RawSanityBlockContent[];
  sections?: RawSanitySection[];
  seo?: RawSanitySeo;
  customCode?: {
    customCss?: string;
    headerScripts?: string;
    footerScripts?: string;
  };
  visibility?: Record<string, boolean>;
  layoutOverride?: Record<string, string | boolean>;
  customBodyClass?: string;
  animation?: string;
  anchorId?: string;
  themePreset?: string;
}

// ─── Sections ────────────────────────────────────────────────────────────

export interface RawSanitySection {
  _type?: string;
  _key?: string;
  type?: string;
  title?: string;
  heading?: string;
  text?: unknown;
  image?: RawSanityImage;
  backgroundImage?: RawSanityImage;
  items?: unknown[];
  settings?: Record<string, unknown>;
  sections?: RawSanitySection[];
  section?: RawSanityGlobalSectionRef;
  form?: RawSanityFormRef;
}

export interface RawSanityFormRef {
  _id?: string;
  title?: string;
  formType?: string;
  successMessage?: string;
  emailTo?: string;
  fields?: {
    name?: string;
    label?: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
    options?: string[];
  }[];
}

// ─── Post ────────────────────────────────────────────────────────────────

export interface RawSanityPost {
  title?: string;
  slug?: string;
  excerpt?: string;
  publishedAt?: string;
  categories?: string[];
  tags?: string[];
  featuredImage?: RawSanityImage;
  archiveImage?: RawSanityImage;
  ogImage?: RawSanityImage;
  banner?: RawSanityBanner;
  content?: RawSanityBlockContent[];
  seo?: RawSanitySeo;
  customCode?: {
    customCss?: string;
    headerScripts?: string;
    footerScripts?: string;
  };
  author?: RawSanityAuthor;
  visibility?: Record<string, boolean>;
  customBodyClass?: string;
  themePreset?: string;
}

export interface RawSanityAuthor {
  name?: string;
  slug?: string;
  role?: string;
  bio?: string;
  email?: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  github?: string;
  photo?: RawSanityImage;
}

// ─── Settings ────────────────────────────────────────────────────────────

export interface RawSanitySiteSettings {
  siteTitle?: string;
  tagline?: string;
  theme?: Record<string, unknown>;
  logo?: RawSanityImage;
  darkLogo?: RawSanityImage;
  favicon?: RawSanityImage;
  phone?: string;
  email?: string;
  address?: string;
  social?: Record<string, unknown>;
  customCode?: {
    globalCss?: string;
    globalHeaderScripts?: string;
    globalFooterScripts?: string;
  };
}

export interface RawSanityThemeSettings {
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  tokens?: Record<string, unknown>;
  typography?: Record<string, unknown>;
  containerWidth?: string;
  buttonStyle?: string;
  buttonRadius?: string;
  header?: Record<string, unknown>;
  footer?: {
    showFooterWidgets?: boolean;
    copyrightText?: string;
    footerCta?: { label?: string; url?: string };
    socialLinks?: { platform?: string; url?: string }[];
  };
  blog?: Record<string, unknown>;
}

// ─── Widget ──────────────────────────────────────────────────────────────

export interface RawSanityWidget {
  id?: string;
  area?: string;
  type?: string;
  title?: string;
  content?: unknown;
  menuName?: string;
  buttonLabel?: string;
  buttonUrl?: string;
  order?: number;
}

// ─── Team Member ─────────────────────────────────────────────────────────

export interface RawSanityTeamMember {
  name?: string;
  slug?: string;
  role?: string;
  bio?: string;
  email?: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  github?: string;
  photo?: RawSanityImage;
}

// ─── Global Section ──────────────────────────────────────────────────────

export interface RawSanityGlobalSection {
  title?: string;
  key?: string;
  sectionType?: string;
  content?: Record<string, unknown>;
}

// ─── Knowledge Base ──────────────────────────────────────────────────────

export interface RawSanityKbCategory {
  id?: string;
  title?: string;
  slug?: string;
  description?: string;
  icon?: string;
  order?: number;
  parentId?: string;
  articleCount?: number;
}

export interface RawSanityKbArticle {
  id?: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  publishedAt?: string;
  content?: RawSanityBlockContent[];
  category?: { id?: string; title?: string; slug?: string; description?: string };
  categorySlug?: string;
  tags?: string[];
  featured?: boolean;
  author?: RawSanityAuthor;
  seo?: RawSanitySeo;
  relatedArticles?: { title?: string; slug?: string }[];
}

// ─── Form ────────────────────────────────────────────────────────────────

export interface RawSanityForm {
  _id?: string;
  title?: string;
  formType?: string;
  successMessage?: string;
  emailTo?: string;
  fields?: {
    name?: string;
    label?: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
    options?: string[];
  }[];
}

// ─── Search Result ───────────────────────────────────────────────────────

export interface RawSanitySearchItem {
  _id?: string;
  title?: string;
  slug?: string;
  excerpt?: string;
}

export interface RawSanitySearchResults {
  pages?: RawSanitySearchItem[];
  posts?: RawSanitySearchItem[];
  team?: RawSanitySearchItem[];
  testimonials?: RawSanitySearchItem[];
  services?: RawSanitySearchItem[];
}
