/**
 * Raw API response types for non-Sanity CMS adapters.
 *
 * WordPress: REST API JSON response shapes
 * Contentful: Contentful Delivery API response shapes
 * EmDash: Custom API response shapes
 */

// ═══════════════════════════════════════════════════════════════════════════
// WordPress REST API Raw Types
// ═══════════════════════════════════════════════════════════════════════════

export interface RawWpPage {
  id?: number;
  slug?: string;
  title?: { rendered?: string };
  content?: { rendered?: string };
  excerpt?: { rendered?: string };
  template?: string;
  date?: string;
  _embedded?: RawWpEmbedded;
  yoast_head_json?: RawWpYoastSeo;
  rank_math?: RawWpRankMathSeo;
}

export interface RawWpPost {
  id?: number;
  slug?: string;
  title?: { rendered?: string };
  content?: { rendered?: string };
  excerpt?: { rendered?: string };
  date?: string;
  categories?: string[];
  tags?: string[];
  _embedded?: RawWpEmbedded;
  yoast_head_json?: RawWpYoastSeo;
  rank_math?: RawWpRankMathSeo;
}

export interface RawWpEmbedded {
  "wp:featuredmedia"?: RawWpMedia[];
  "wp:term"?: RawWpTerm[][];
  author?: RawWpAuthor[];
}

export interface RawWpMedia {
  source_url?: string;
  alt_text?: string;
  media_details?: {
    width?: number;
    height?: number;
    credit?: string;
    sizes?: Record<string, { source_url?: string; width?: number; height?: number }>;
  };
  caption?: { rendered?: string };
  credit?: string;
}

export interface RawWpTerm {
  name?: string;
  slug?: string;
}

export interface RawWpAuthor {
  name?: string;
  slug?: string;
  description?: string;
  url?: string;
  avatar_urls?: Record<string, string>;
}

export interface RawWpYoastSeo {
  title?: string;
  description?: string;
  canonical?: string;
  robots?: { index?: string; follow?: string };
  og_image?: { url?: string }[];
  twitter_image?: string;
  og_type?: string;
  twitter_card?: string;
}

export interface RawWpRankMathSeo {
  title?: string;
  description?: string;
  canonical_url?: string;
  robots?: { index?: string; follow?: string };
  thumbnail?: string;
}

export interface RawWpMenu {
  name?: string;
  slug?: string;
  items?: RawWpMenuItem[];
  menu_items?: RawWpMenuItem[];
  title?: { rendered?: string };
}

export interface RawWpMenuItem {
  label?: string;
  title?: string;
  name?: string;
  url?: string;
  link?: string;
  href?: string;
  type?: string;
  itemType?: string;
  description?: string;
  icon?: string;
  classes?: string[];
  cssClass?: string;
  target?: string;
  targetBlank?: boolean;
  children?: RawWpMenuItem[];
}

export interface RawWpWidget {
  id?: string;
  _id?: string;
  sidebar?: string;
  widgetArea?: string;
  name?: string;
  title?: string;
  type?: string;
  content?: string;
  html?: string;
  menuName?: string;
  buttonLabel?: string;
  buttonUrl?: string;
}

export interface RawWpSiteSettings {
  title?: string;
  name?: string;
  description?: string;
  site_logo?: string;
  site_icon_url?: string;
  email?: string;
}

export interface RawWpTeamMember {
  title?: { rendered?: string };
  name?: string;
  slug?: string;
  content?: { rendered?: string };
  acf?: Record<string, unknown>;
  meta?: Record<string, unknown>;
  _embedded?: RawWpEmbedded;
}

export interface RawWpSearchItem {
  id?: number;
  title?: string;
  slug?: string;
  url?: string;
  subtype?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// Contentful Delivery API Raw Types
// ═══════════════════════════════════════════════════════════════════════════

export interface RawContentfulEntry<T = Record<string, unknown>> {
  sys?: {
    id?: string;
    createdAt?: string;
    contentType?: {
      sys?: {
        id?: string;
      };
    };
  };
  fields?: T;
}

export interface RawContentfulResponse<T = any> {
  items?: T[];
  includes?: {
    Asset?: RawContentfulAsset[];
  };
}

export interface RawContentfulAsset {
  sys?: { id?: string };
  fields?: {
    title?: string;
    description?: string;
    credit?: string;
    focalPoint?: { x: number; y: number };
    file?: {
      url?: string;
      details?: {
        image?: {
          width?: number;
          height?: number;
        };
      };
    };
  };
}

export interface RawContentfulPageFields {
  title?: string;
  slug?: string;
  template?: string;
  layout?: string;
  content?: string;
  sections?: unknown[];
  featuredImage?: { sys?: { id?: string } };
  seoTitle?: string;
  seoDescription?: string;
  seoImage?: { sys?: { id?: string } };
  canonicalUrl?: string;
  noindex?: boolean;
  nofollow?: boolean;
  excerpt?: string;
  description?: string;
}

export interface RawContentfulPostFields {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  publishedAt?: string;
  categories?: string[];
  tags?: string[];
  featuredImage?: { sys?: { id?: string } };
  author?: RawContentfulEntry<RawContentfulAuthorFields>;
  seoTitle?: string;
  seoDescription?: string;
  seoImage?: { sys?: { id?: string } };
  canonicalUrl?: string;
  noindex?: boolean;
}

export interface RawContentfulAuthorFields {
  name?: string;
  slug?: string;
  role?: string;
  bio?: string;
  photo?: RawContentfulAsset;
}

export interface RawContentfulMenuFields {
  name?: string;
  title?: string;
  items?: RawContentfulEntry<RawContentfulMenuItemFields>[];
}

export interface RawContentfulMenuItemFields {
  label?: string;
  url?: string;
  description?: string;
  targetBlank?: boolean;
  children?: RawContentfulEntry<RawContentfulMenuItemFields>[];
}

export interface RawContentfulWidgetFields {
  area?: string;
  type?: string;
  title?: string;
  content?: string;
  menuName?: string;
  buttonLabel?: string;
  buttonUrl?: string;
}

export interface RawContentfulFormFields {
  title?: string;
  formType?: string;
  successMessage?: string;
  emailTo?: string;
  fields?: RawContentfulEntry<RawContentfulFormFieldFields>[];
}

export interface RawContentfulFormFieldFields {
  name?: string;
  label?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

export interface RawContentfulTeamMemberFields {
  name?: string;
  slug?: string;
  role?: string;
  bio?: string;
  photo?: { sys?: { id?: string } };
  email?: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  github?: string;
}

export interface RawContentfulSettingsFields {
  siteTitle?: string;
  title?: string;
  tagline?: string;
  description?: string;
  logo?: { sys?: { id?: string } };
  favicon?: { sys?: { id?: string } };
  phone?: string;
  email?: string;
  address?: string;
  social?: Record<string, unknown>;
  theme?: Record<string, unknown>;
}

export interface RawContentfulThemeFields {
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  tokens?: Record<string, unknown>;
  typography?: Record<string, unknown>;
  containerWidth?: string;
  buttonStyle?: string;
  header?: Record<string, unknown>;
  footer?: Record<string, unknown>;
}

export interface RawContentfulCategoryFields {
  name?: string;
  slug?: string;
  count?: number;
}

export interface RawContentfulTagFields {
  name?: string;
  slug?: string;
  count?: number;
}

export interface RawContentfulGlobalSectionFields {
  title?: string;
  key?: string;
  sectionType?: string;
  content?: Record<string, unknown>;
}

export interface RawContentfulSavedSectionFields {
  title?: string;
  slug?: string;
  description?: string;
  category?: string;
  sectionType?: string;
  content?: Record<string, unknown>;
  version?: number;
  status?: string;
  thumbnail?: { fields?: { file?: { url?: string } } };
}

// ═══════════════════════════════════════════════════════════════════════════
// EmDash API Raw Types
// ═══════════════════════════════════════════════════════════════════════════

export interface RawEmDashPage {
  title?: string;
  slug?: string;
  path?: string;
  template?: string;
  layout?: string;
  content?: string;
  html?: string;
  sections?: unknown[];
  featuredImage?: RawEmDashImage;
  banner?: RawEmDashBanner;
  seo?: RawEmDashSeo;
  excerpt?: string;
  customCode?: Record<string, unknown>;
}

export interface RawEmDashPost {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  html?: string;
  publishedAt?: string;
  createdAt?: string;
  categories?: string[];
  tags?: string[];
  featuredImage?: RawEmDashImage;
  ogImage?: RawEmDashImage;
  archiveImage?: RawEmDashImage;
  banner?: RawEmDashBanner;
  author?: RawEmDashAuthor;
  seo?: RawEmDashSeo;
  customCode?: Record<string, unknown>;
}

export interface RawEmDashImage {
  src?: string;
  url?: string;
  alt?: string;
  width?: number;
  height?: number;
  caption?: string;
  credit?: string;
  lqip?: string;
  focalPoint?: { x: number; y: number };
}

export interface RawEmDashBanner {
  eyebrow?: string;
  heading?: string;
  text?: string;
  image?: RawEmDashImage;
  overlay?: boolean;
  alignment?: string;
}

export interface RawEmDashSeo {
  title?: string;
  description?: string;
  image?: string;
  canonicalUrl?: string;
  noindex?: boolean;
  nofollow?: boolean;
  ogType?: string;
  twitterCard?: string;
}

export interface RawEmDashAuthor {
  name?: string;
  slug?: string;
  role?: string;
  bio?: string;
  photo?: RawEmDashImage;
  email?: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  github?: string;
}

export interface RawEmDashMenu {
  name?: string;
  location?: string;
  schemaVersion?: number;
  items?: RawEmDashMenuItem[];
}

export interface RawEmDashMenuItem {
  label?: string;
  title?: string;
  url?: string;
  href?: string;
  itemType?: string;
  type?: string;
  description?: string;
  icon?: string;
  cssClass?: string;
  targetBlank?: boolean;
  target?: string;
  isMegaMenu?: boolean;
  megaMenuColumns?: number;
  children?: RawEmDashMenuItem[];
}

export interface RawEmDashWidget {
  id?: string;
  _id?: string;
  area?: string;
  widgetArea?: string;
  type?: string;
  title?: string;
  content?: string;
  html?: string;
  menuName?: string;
  buttonLabel?: string;
  buttonUrl?: string;
}

export interface RawEmDashSettings {
  siteTitle?: string;
  title?: string;
  tagline?: string;
  description?: string;
  logo?: RawEmDashImage;
  favicon?: RawEmDashImage;
  phone?: string;
  email?: string;
  address?: string;
  social?: Record<string, unknown>;
  theme?: Record<string, unknown>;
  customCode?: Record<string, unknown>;
}

export interface RawEmDashThemeSettings {
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  tokens?: Record<string, unknown>;
  typography?: Record<string, unknown>;
  containerWidth?: string;
  buttonStyle?: string;
  header?: Record<string, unknown>;
  footer?: Record<string, unknown>;
}

export interface RawEmDashForm {
  id?: string;
  _id?: string;
  title?: string;
  formType?: string;
  successMessage?: string;
  emailTo?: string;
  fields?: RawEmDashFormField[];
}

export interface RawEmDashFormField {
  name?: string;
  label?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

export interface RawEmDashTeamMember {
  name?: string;
  slug?: string;
  role?: string;
  bio?: string;
  photo?: RawEmDashImage;
  avatar?: RawEmDashImage;
  email?: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  github?: string;
}

export interface RawEmDashGlobalSection {
  title?: string;
  key?: string;
  sectionType?: string;
  content?: Record<string, unknown>;
}

export interface RawEmDashSearchItem {
  id?: string;
  _id?: string;
  title?: string;
  excerpt?: string;
  slug?: string;
  path?: string;
  url?: string;
  type?: string;
}

export interface RawEmDashTaxonomy {
  id?: string;
  _id?: string;
  name?: string;
  slug?: string;
  count?: number;
}

export interface RawEmDashSavedSection {
  id?: string;
  _id?: string;
  title?: string;
  slug?: string;
  description?: string;
  category?: string;
  sectionType?: string;
  content?: Record<string, unknown>;
  thumbnail?: string;
  version?: number;
  status?: string;
}
