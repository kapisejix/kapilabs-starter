import { defineField, defineType } from "sanity";

export const themeSettingsType = defineType({
  name: "themeSettings",
  title: "Theme Settings",
  type: "document",
  groups: [
    { name: "colors", title: "Colors", default: true },
    { name: "typography", title: "Typography" },
    { name: "layout", title: "Layout" },
    { name: "headerFooter", title: "Header & Footer" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Internal Label",
      type: "string",
      description: "For reference only — not shown publicly",
      initialValue: "Theme Settings",
      group: "colors",
    }),

    // ── Colors ──
    defineField({
      name: "primaryColor",
      title: "Primary Color",
      type: "string",
      initialValue: "#111827",
      group: "colors",
    }),
    defineField({
      name: "secondaryColor",
      title: "Secondary Color",
      type: "string",
      initialValue: "#2563eb",
      group: "colors",
    }),
    defineField({
      name: "backgroundColor",
      title: "Background Color",
      type: "string",
      initialValue: "#ffffff",
      group: "colors",
    }),
    defineField({
      name: "textColor",
      title: "Text Color",
      type: "string",
      initialValue: "#111827",
      group: "colors",
    }),

    defineField({
      name: "tokens",
      title: "Design Tokens",
      type: "object",
      group: "colors",
      fields: [
        defineField({
          name: "colors",
          title: "Colors",
          type: "object",
          fields: [
            defineField({ name: "primary", title: "Primary", type: "string", initialValue: "#111827" }),
            defineField({ name: "secondary", title: "Secondary", type: "string", initialValue: "#2563eb" }),
            defineField({ name: "background", title: "Background", type: "string", initialValue: "#ffffff" }),
            defineField({ name: "text", title: "Text", type: "string", initialValue: "#111827" }),
            defineField({ name: "muted", title: "Muted", type: "string", initialValue: "#6b7280" }),
            defineField({ name: "border", title: "Border", type: "string", initialValue: "#e5e7eb" }),
            defineField({ name: "softBackground", title: "Soft Background", type: "string", initialValue: "#f9fafb" }),
            defineField({ name: "accent", title: "Accent", type: "string", initialValue: "#f59e0b" }),
            defineField({ name: "surface", title: "Surface", type: "string", initialValue: "#ffffff" }),
            defineField({ name: "link", title: "Link", type: "string", initialValue: "#2563eb" }),
            defineField({ name: "button", title: "Button", type: "string", initialValue: "#111827" }),
          ],
        }),
        defineField({
          name: "dark",
          title: "Dark Mode Colors",
          type: "object",
          fields: [
            defineField({ name: "primary", title: "Primary", type: "string", initialValue: "#ffffff" }),
            defineField({ name: "secondary", title: "Secondary", type: "string", initialValue: "#93c5fd" }),
            defineField({ name: "background", title: "Background", type: "string", initialValue: "#0f172a" }),
            defineField({ name: "text", title: "Text", type: "string", initialValue: "#e2e8f0" }),
            defineField({ name: "muted", title: "Muted", type: "string", initialValue: "#94a3b8" }),
            defineField({ name: "border", title: "Border", type: "string", initialValue: "#1e293b" }),
            defineField({ name: "surface", title: "Surface", type: "string", initialValue: "#1e293b" }),
          ],
        }),
        defineField({
          name: "spacing",
          title: "Spacing",
          type: "object",
          fields: [
            defineField({ name: "xs", title: "XS", type: "string", initialValue: "0.5rem" }),
            defineField({ name: "sm", title: "SM", type: "string", initialValue: "1rem" }),
            defineField({ name: "md", title: "MD", type: "string", initialValue: "1.5rem" }),
            defineField({ name: "lg", title: "LG", type: "string", initialValue: "2rem" }),
            defineField({ name: "xl", title: "XL", type: "string", initialValue: "3rem" }),
            defineField({ name: "xxl", title: "2XL", type: "string", initialValue: "4rem" }),
          ],
        }),
        defineField({
          name: "radius",
          title: "Radius",
          type: "object",
          fields: [
            defineField({ name: "sm", title: "SM", type: "string", initialValue: "0.375rem" }),
            defineField({ name: "md", title: "MD", type: "string", initialValue: "0.5rem" }),
            defineField({ name: "lg", title: "LG", type: "string", initialValue: "1rem" }),
            defineField({ name: "full", title: "Full", type: "string", initialValue: "999px" }),
          ],
        }),
        defineField({ name: "containerWidth", title: "Container Width", type: "string", initialValue: "1200px" }),
        defineField({
          name: "breakpoints",
          title: "Breakpoints",
          type: "object",
          fields: [
            defineField({ name: "sm", title: "SM", type: "string", initialValue: "640px" }),
            defineField({ name: "md", title: "MD", type: "string", initialValue: "768px" }),
            defineField({ name: "lg", title: "LG", type: "string", initialValue: "1024px" }),
            defineField({ name: "xl", title: "XL", type: "string", initialValue: "1280px" }),
          ],
        }),
      ],
    }),

    // ── Typography ──
    defineField({
      name: "typography",
      title: "Typography",
      type: "object",
      group: "typography",
      fields: [
        defineField({ name: "fontFamily", title: "Font Family", type: "string", initialValue: "system-ui, sans-serif" }),
        defineField({ name: "headingFontFamily", title: "Heading Font Family", type: "string", initialValue: "system-ui, sans-serif" }),
        defineField({ name: "baseSize", title: "Base Font Size", type: "string", initialValue: "16px" }),
        defineField({ name: "scale", title: "Type Scale Ratio", type: "string", initialValue: "1.25", description: "e.g. 1.25 (major third), 1.333 (perfect fourth)" }),
        defineField({ name: "lineHeight", title: "Body Line Height", type: "string", initialValue: "1.6" }),
        defineField({ name: "headingLineHeight", title: "Heading Line Height", type: "string", initialValue: "1.2" }),
        defineField({ name: "letterSpacing", title: "Letter Spacing", type: "string", initialValue: "0" }),
        defineField({ name: "fontWeight", title: "Body Font Weight", type: "string", initialValue: "400" }),
        defineField({ name: "headingFontWeight", title: "Heading Font Weight", type: "string", initialValue: "700" }),
      ],
    }),

    // ── Layout ──
    defineField({
      name: "containerWidth",
      title: "Container Width",
      type: "string",
      initialValue: "1200px",
      group: "layout",
    }),

    defineField({
      name: "buttonStyle",
      title: "Button Style",
      type: "string",
      group: "layout",
      options: {
        list: [
          { title: "Rounded", value: "rounded" },
          { title: "Pill", value: "pill" },
          { title: "Square", value: "square" },
        ],
      },
      initialValue: "rounded",
    }),

    // ── Header & Footer ──
    defineField({
      name: "header",
      title: "Header Settings",
      type: "object",
      group: "headerFooter",
      fields: [
        defineField({ name: "sticky", title: "Sticky Header", type: "boolean", initialValue: false }),
        defineField({ name: "showTopBar", title: "Show Top Bar", type: "boolean", initialValue: true }),
        defineField({ name: "showCta", title: "Show CTA Button", type: "boolean", initialValue: false }),
        defineField({ name: "ctaLabel", title: "CTA Label", type: "string", initialValue: "Contact" }),
        defineField({ name: "ctaUrl", title: "CTA URL", type: "string", initialValue: "/contact" }),
      ],
    }),

    defineField({
      name: "footer",
      title: "Footer Settings",
      type: "object",
      group: "headerFooter",
      fields: [
        defineField({ name: "showFooterWidgets", title: "Show Footer Widgets", type: "boolean", initialValue: true }),
        defineField({ name: "copyrightText", title: "Copyright Text", type: "string" }),
        defineField({
          name: "footerCta",
          title: "Footer CTA",
          type: "object",
          fields: [
            defineField({ name: "label", title: "CTA Label", type: "string" }),
            defineField({ name: "url", title: "CTA URL", type: "string" }),
          ],
        }),
        defineField({
          name: "socialLinks",
          title: "Social Links",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                defineField({ name: "platform", title: "Platform", type: "string" }),
                defineField({ name: "url", title: "URL", type: "url" }),
              ],
            },
          ],
        }),
      ],
    }),

    defineField({
      name: "blog",
      title: "Blog Settings",
      type: "object",
      group: "headerFooter",
      fields: [
        defineField({ name: "showAuthor", title: "Show Author", type: "boolean", initialValue: true }),
        defineField({ name: "showDate", title: "Show Date", type: "boolean", initialValue: true }),
        defineField({ name: "showCategories", title: "Show Categories", type: "boolean", initialValue: true }),
        defineField({ name: "readingTime", title: "Show Reading Time", type: "boolean", initialValue: false }),
        defineField({ name: "excerptLength", title: "Excerpt Length (chars)", type: "number", initialValue: 160 }),
        defineField({ name: "postsPerPage", title: "Posts Per Page", type: "number", initialValue: 10 }),
      ],
    }),
  ],

  preview: {
    select: {
      title: "title",
    },
    prepare() {
      return { title: "Theme Settings" };
    },
  },
});
