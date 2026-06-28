import { mapSanityImage } from "./image";
import { renderShortcodes } from "@kapi/shortcodes/renderShortcodes";
import { renderRegisteredShortcode } from "@kapi/shortcodes/registry";
import type {
  CmsGlobalSection,
  CmsMenu,
  CmsMenuItem,
  CmsPage,
  CmsPost,
  CmsSiteSettings,
  CmsThemeSettings,
  CmsWidget,
  RichContent,
  RichContentBlock,
} from "../types";
import type {
  RawSanityBlock,
  RawSanityBlockContent,
  RawSanityGlobalSection,
  RawSanityGlobalSectionRef,
  RawSanityImage,
  RawSanityMarkDef,
  RawSanityMenu,
  RawSanityMenuItem,
  RawSanityPage,
  RawSanityPost,
  RawSanitySection,
  RawSanitySiteSettings,
  RawSanitySpan,
  RawSanityTeamMember,
  RawSanityThemeSettings,
  RawSanityWidget,
} from "./raw-types";
import { RawPageSchema, RawPostSchema, RawSiteSettingsSchema, RawThemeSettingsSchema } from "../validation";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function spansToHtml(
  children: RawSanitySpan[] = [],
  markDefs: RawSanityMarkDef[] = []
): string {
  return children
    .filter((c) => c._type === "span")
    .map((span) => {
      let html = escapeHtml(span.text || "");

      for (const mark of (span.marks || []) as string[]) {
        const def = markDefs.find((d) => d._key === mark);

        if (def) {
          if (def._type === "link") {
            const target = def.blank ? ' target="_blank"' : "";
            const rel = def.blank ? ' rel="noopener noreferrer"' : "";
            html = `<a href="${escapeHtml(def.href || "#")}"${target}${rel}>${html}</a>`;
          }
        } else {
          switch (mark) {
            case "strong":
              html = `<strong>${html}</strong>`;
              break;
            case "em":
              html = `<em>${html}</em>`;
              break;
            case "underline":
              html = `<u>${html}</u>`;
              break;
            case "code":
              html = `<code>${html}</code>`;
              break;
            case "strike-through":
              html = `<s>${html}</s>`;
              break;
          }
        }
      }

      return html;
    })
    .join("");
}

export function mapPortableText(blocks: RawSanityBlockContent[] | undefined | null): RichContent {
  if (!Array.isArray(blocks)) return [];

  const result: RichContentBlock[] = [];
  let i = 0;

  while (i < blocks.length) {
    const block = blocks[i];

    if (!block) {
      i++;
      continue;
    }

    if (block._type === "block") {
      const b = block as RawSanityBlock;
      const style: string = b.style || "normal";
      const markDefs = b.markDefs || [];
      const html = spansToHtml(b.children || [], markDefs);
      const level = b.level || 1;

      if (b.listItem) {
        const listType = b.listItem === "number" ? "number" : "bullet";
        const items: string[] = [html];

        // Group consecutive list items at the same level
        while (
          i + 1 < blocks.length &&
          (blocks[i + 1] as RawSanityBlock)?._type === "block" &&
          (blocks[i + 1] as RawSanityBlock)?.listItem === b.listItem &&
          ((blocks[i + 1] as RawSanityBlock)?.level || 1) === level
        ) {
          i++;
          items.push(spansToHtml((blocks[i] as RawSanityBlock).children || [], (blocks[i] as RawSanityBlock).markDefs || []));
        }

        result.push({ type: "list", listType, items, level: level > 1 ? level : undefined });
      } else if (style === "blockquote") {
        result.push({ type: "blockquote", html });
      } else if (style === "code" && b.code) {
        result.push({ type: "code", code: b.code, language: b.language || "text" });
      } else if (/^h[1-6]$/.test(style)) {
        result.push({
          type: "heading",
          level: parseInt(style[1]) as 1 | 2 | 3 | 4 | 5 | 6,
          html,
        });
      } else {
        result.push({ type: "paragraph", html: renderShortcodes(html) });
      }
    } else if (block._type === "image") {
      const ib = block as RawSanityImage & { caption?: string };
      const image = mapSanityImage(ib, ib.alt);

      if (image) {
        result.push({ type: "image", image, caption: ib.caption });
      }
    } else if (block._type === "shortcode") {
      const sc = block as { name?: string; attrs?: string };
      const html = renderRegisteredShortcode(sc.name || "", sc.attrs || "");
      result.push({ type: "shortcode", html });
    } else if (block._type === "codeBlock") {
      const cb = block as { code?: string; language?: string };
      result.push({ type: "code", code: cb.code || "", language: cb.language || "text" });
    } else if (block._type === "sectionRef") {
      const sr = block as { section?: RawSanityGlobalSectionRef };
      const gs = sr.section;
      if (gs) {
        result.push({
          type: "sectionRef",
          sectionKey: gs.key || "",
          sectionTitle: gs.title || "",
          sections: mapSections(gs.sections || []),
        });
      }
    }

    i++;
  }

  return result;
}

function renderPortableText(blocks: RawSanityBlockContent[] | undefined | null): string {
  if (!Array.isArray(blocks) || blocks.length === 0) return "";

  const blockItems = blocks.filter(
    (b): b is RawSanityBlock => b._type === "block"
  );

  return blockItems
    .map((block) => {
      const markDefs = block.markDefs || [];
      const html = spansToHtml(block.children || [], markDefs);
      const style = block.style || "normal";

      if (style === "normal") return `<p>${html}</p>`;
      if (style === "blockquote") return `<blockquote>${html}</blockquote>`;
      if (/^h[1-6]$/.test(style)) return `<${style}>${html}</${style}>`;
      return `<p>${html}</p>`;
    })
    .join("\n");
}

function mapSections(sections: RawSanitySection[] = []): Record<string, unknown>[] {
  return sections.flatMap((section) => {
    if (section._type === "sectionRef") {
      const gs = section.section;
      if (!gs?.sections?.length) return [];
      return mapSections(gs.sections);
    }

    const typeMap: Record<string, string> = {
      sectionHero: "hero",
      sectionContent: "content",
      sectionServices: "services",
      sectionStats: "stats",
      sectionFaq: "faq",
      sectionTeam: "team",
      sectionTestimonials: "testimonials",
      sectionCta: "cta",
      sectionHtml: "html",
      sectionBlogPreview: "blog-preview",
      sectionContact: "contact",
      sectionForm: "form",
    };

    const mapped: Record<string, unknown> = {
      ...section,
      type: section.type || typeMap[section._type || ""] || section._type,
      image: mapSanityImage(section.image as RawSanityImage | undefined, section.heading || section.title),
      backgroundImage: mapSanityImage(
        section.backgroundImage as RawSanityImage | undefined,
        section.heading || section.title
      ),
      settings: section.settings || undefined,
    };

    // Convert Portable Text blocks in section text fields to HTML strings
    if (Array.isArray(section.text)) {
      mapped.text = renderPortableText(section.text as RawSanityBlockContent[]);
    }

    if (Array.isArray(section.items)) {
      mapped.items = section.items.map((item: unknown) => {
        const enriched: Record<string, unknown> = { ...(item as Record<string, unknown>) };
        const itemRec = item as Record<string, unknown>;
        if (Array.isArray(itemRec.text)) {
          enriched.text = renderPortableText(itemRec.text as RawSanityBlockContent[]);
        }
        if (Array.isArray(itemRec.answer)) {
          enriched.answer = renderPortableText(itemRec.answer as RawSanityBlockContent[]);
        }
        if (Array.isArray(itemRec.quote)) {
          enriched.quote = renderPortableText(itemRec.quote as RawSanityBlockContent[]);
        }
        if (Array.isArray(itemRec.bio)) {
          enriched.bio = renderPortableText(itemRec.bio as RawSanityBlockContent[]);
        }
        return enriched;
      });
    }

    return [mapped];
  });
}

export function mapSanityPage(page: RawSanityPage | undefined | null): CmsPage | null {
  if (!page) return null;

  // Development-mode validation: log warning if raw data deviates from expected shape
  if (import.meta.env.DEV) {
    const result = RawPageSchema.safeParse(page);
    if (!result.success) {
      console.warn("[kapi] mapSanityPage: raw data validation warning", result.error.issues);
    }
  }

  const seoImage = mapSanityImage(page.seoImage, page.seo?.title || page.title);
  const featuredImage = mapSanityImage(page.featuredImage, page.title);

  return {
    title: page.title || "",
    slug: page.slug || "",
    template: page.template || "default",
    layout: page.layout || "content-sidebar",
    featuredImage,
    banner: {
      eyebrow: page.banner?.eyebrow,
      heading: page.banner?.heading,
      text: page.banner?.text,
      image: mapSanityImage(page.banner?.image as RawSanityImage | undefined, page.banner?.heading || page.title),
      overlay: page.banner?.overlay,
      alignment: page.banner?.alignment as "left" | "center" | "right" | undefined,
    },
    content: mapPortableText(page.content),
    contentMode: page.contentMode as "rich" | "html" | "code" | undefined,
    sections: mapSections(page.sections || []) as CmsPage["sections"],
    customCode: page.customCode || {},
    seo: {
      ...(page.seo || {}),
      ogType: page.seo?.ogType as "article" | "website" | undefined,
      twitterCard: page.seo?.twitterCard as "summary" | "summary_large_image" | undefined,
      image: seoImage || (page.seo?.image as string | undefined) || featuredImage || null,
    },
    visibility: page.visibility as CmsPage["visibility"],
    layoutOverride: page.layoutOverride as CmsPage["layoutOverride"],
    customBodyClass: page.customBodyClass,
    animation: page.animation,
    anchorId: page.anchorId,
    themePreset: page.themePreset,
  };
}

export function mapSanityPost(post: RawSanityPost | undefined | null): CmsPost | null {
  if (!post) return null;

  if (import.meta.env.DEV) {
    const result = RawPostSchema.safeParse(post);
    if (!result.success) {
      console.warn("[kapi] mapSanityPost: raw data validation warning", result.error.issues);
    }
  }

  const featuredImage = mapSanityImage(post.featuredImage, post.title);
  const archiveImage = mapSanityImage(post.archiveImage, post.title);
  const ogImage = mapSanityImage(post.ogImage, post.seo?.title || post.title);

  return {
    title: post.title || "",
    slug: post.slug || "",
    excerpt: post.excerpt,
    featuredImage,
    archiveImage,
    ogImage,
    banner: {
      eyebrow: post.banner?.eyebrow,
      heading: post.banner?.heading,
      text: post.banner?.text,
      image: mapSanityImage(post.banner?.image as RawSanityImage | undefined, post.banner?.heading || post.title),
      overlay: post.banner?.overlay,
      alignment: post.banner?.alignment as "left" | "center" | "right" | undefined,
    },
    content: mapPortableText(post.content),
    publishedAt: post.publishedAt,
    categories: post.categories || [],
    tags: post.tags || [],
    customCode: post.customCode || {},

    author: post.author
      ? {
          name: post.author.name || "",
          slug: post.author.slug || "",
          role: post.author.role,
          bio: post.author.bio,
          photo: mapSanityImage(post.author.photo, post.author.name),
          email: post.author.email,
          website: post.author.website,
          linkedin: post.author.linkedin,
          twitter: post.author.twitter,
          github: post.author.github,
        }
      : undefined,
    seo: {
      ...(post.seo || {}),
      ogType: post.seo?.ogType as "article" | "website" | undefined,
      twitterCard: post.seo?.twitterCard as "summary" | "summary_large_image" | undefined,
      image: ogImage || (post.seo?.image as string | undefined) || featuredImage || null,
    },
    visibility: post.visibility as CmsPost["visibility"],
    customBodyClass: post.customBodyClass,
    themePreset: post.themePreset,
  };
}

function resolveMenuItemUrl(item: RawSanityMenuItem): string {
  switch (item?.itemType) {
    case "page":
      return item.page?.slug === "home" ? "/" : `/${item.page?.slug || ""}`;
    case "post":
      return `/blog/${item.post?.slug || ""}`;
    case "teamMember":
      return `/team/${item.teamMember?.slug || ""}`;
    case "category":
      return `/category/${item.category || ""}`;
    case "tag":
      return `/tag/${item.tag || ""}`;
    case "button":
      return item?.url || "/contact";
    case "anchor":
      return item?.url || "#";
    case "section":
      return item.sectionSlug ? `#${item.sectionSlug}` : item?.url || "#";
    case "custom":
    default:
      return item?.url || "#";
  }
}

function resolveMenuItemLabel(item: RawSanityMenuItem): string {
  return (
    item?.label ||
    item?.page?.title ||
    item?.post?.title ||
    item?.teamMember?.name ||
    item?.category ||
    item?.tag ||
    "Menu Item"
  );
}

function mapMenuItems(items: RawSanityMenuItem[] = []): CmsMenuItem[] {
  return items.map((item) => ({
    label: resolveMenuItemLabel(item),
    url: resolveMenuItemUrl(item),
    type: (item.itemType as CmsMenuItem["type"]) || "custom",
    description: item.description || "",
    icon: item.icon || "",
    cssClass: item.cssClass || "",
    targetBlank: Boolean(item.targetBlank),
    isMegaMenu: Boolean(item.isMegaMenu),
    megaMenuColumns: item.megaMenuColumns || 3,
    badge: item.badge || undefined,
    nofollow: Boolean(item.nofollow),
    animation: item.animation || undefined,
    visibility: (item.visibility as "visible" | "hidden" | "logged-in" | "logged-out") || "visible",
    children: Array.isArray(item.children) ? mapMenuItems(item.children) : [],
  }));
}

export function mapSanityMenu(menu: RawSanityMenu | undefined | null): CmsMenu | null {
  if (!menu) return null;

  return {
    name: menu.name || "",
    location: menu.location as CmsMenu["location"],
    schemaVersion: menu.schemaVersion || 1,
    items: Array.isArray(menu.items) ? mapMenuItems(menu.items) : [],
  };
}

export function mapSanitySiteSettings(settings: RawSanitySiteSettings | undefined | null): CmsSiteSettings {
  if (import.meta.env.DEV) {
    const result = RawSiteSettingsSchema.safeParse(settings);
    if (!result.success) {
      console.warn("[kapi] mapSanitySiteSettings: raw data validation warning", result.error.issues);
    }
  }
  return {
    siteTitle: settings?.siteTitle || "KapiLabs",
    tagline: settings?.tagline || "",
    theme: settings?.theme as CmsSiteSettings["theme"],
    logo: mapSanityImage(settings?.logo, settings?.siteTitle || "KapiLabs"),
    darkLogo: mapSanityImage(settings?.darkLogo, "Dark Logo"),
    favicon: mapSanityImage(settings?.favicon, "Favicon"),
    phone: settings?.phone || "",
    email: settings?.email || "",
    address: settings?.address || "",
    social: settings?.social || {},
    customCode: settings?.customCode as CmsSiteSettings["customCode"],
  };
}

export function mapSanityThemeSettings(theme: RawSanityThemeSettings | undefined | null): CmsThemeSettings {
  if (import.meta.env.DEV) {
    const result = RawThemeSettingsSchema.safeParse(theme);
    if (!result.success) {
      console.warn("[kapi] mapSanityThemeSettings: raw data validation warning", result.error.issues);
    }
  }
  return {
    primaryColor: theme?.primaryColor || "#111827",
    secondaryColor: theme?.secondaryColor || "#2563eb",
    backgroundColor: theme?.backgroundColor || "#ffffff",
    textColor: theme?.textColor || "#111827",
    tokens: theme?.tokens as CmsThemeSettings["tokens"],
    typography: theme?.typography as CmsThemeSettings["typography"],
    containerWidth: theme?.containerWidth || "1200px",
    buttonStyle: (theme?.buttonStyle as "rounded" | "pill" | "square") || "rounded",
    buttonRadius: theme?.buttonRadius || undefined,
    header: theme?.header as CmsThemeSettings["header"],
    footer: {
      showFooterWidgets: theme?.footer?.showFooterWidgets,
      copyrightText: theme?.footer?.copyrightText,
      footerCta: theme?.footer?.footerCta || undefined,
      socialLinks: theme?.footer?.socialLinks || undefined,
    },
    blog: theme?.blog as CmsThemeSettings["blog"],
  };
}

export function mapSanityWidgets(widgets: RawSanityWidget[] | undefined | null): CmsWidget[] {
  return (widgets || []).map((widget) => ({
    id: widget.id,
    area: widget.area,
    type: widget.type,
    title: widget.title,
    content: widget.content,
    menuName: widget.menuName,
    buttonLabel: widget.buttonLabel,
    buttonUrl: widget.buttonUrl,
    order: widget.order || 10,
  }));
}

export function mapSanityTeamMember(member: RawSanityTeamMember | undefined | null) {
  if (!member) return null;

  return {
    name: member.name || "",
    slug: member.slug || "",
    role: member.role,
    bio: member.bio,
    photo: mapSanityImage(member.photo, member.name),
    email: member.email,
    website: member.website,
    linkedin: member.linkedin,
    twitter: member.twitter,
    github: member.github,
  };
}

export function mapSanityGlobalSection(section: RawSanityGlobalSection | undefined | null): CmsGlobalSection | null {
  if (!section) return null;

  return {
    title: section.title || "",
    key: section.key || "",
    sectionType: section.sectionType || "",
    content: section.content || {},
  };
}
