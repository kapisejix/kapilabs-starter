import { defineField, defineType } from "sanity";

export const seoType = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "SEO Title",
      type: "string",
    }),

    defineField({
      name: "description",
      title: "SEO Description",
      type: "text",
      rows: 3,
    }),

    defineField({
      name: "image",
      title: "SEO Image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({ name: "alt", title: "Alt Text", type: "string" }),
        defineField({ name: "caption", title: "Caption", type: "string" }),
        defineField({ name: "credit", title: "Credit", type: "string" }),
      ],
    }),

    defineField({
      name: "canonicalUrl",
      title: "Canonical URL",
      type: "url",
    }),

    defineField({
      name: "noindex",
      title: "Noindex",
      type: "boolean",
      initialValue: false,
    }),

    defineField({
      name: "nofollow",
      title: "Nofollow",
      type: "boolean",
      initialValue: false,
    }),

    defineField({
      name: "ogType",
      title: "Open Graph Type",
      type: "string",
      options: {
        list: [
          { title: "Website", value: "website" },
          { title: "Article", value: "article" },
        ],
      },
      initialValue: "website",
    }),

    defineField({
      name: "twitterCard",
      title: "Twitter Card",
      type: "string",
      options: {
        list: [
          { title: "Summary", value: "summary" },
          { title: "Summary Large Image", value: "summary_large_image" },
        ],
      },
      initialValue: "summary_large_image",
    }),

    defineField({
      name: "focusKeyword",
      title: "Focus Keyword",
      type: "string",
      description: "Primary keyword this page targets",
    }),

    defineField({
      name: "breadcrumbTitle",
      title: "Breadcrumb Title",
      type: "string",
      description: "Overrides the page title in breadcrumb navigation",
    }),

    defineField({
      name: "ogTitle",
      title: "OG Title",
      type: "string",
      description: "Overrides the title for social shares",
    }),

    defineField({
      name: "ogDescription",
      title: "OG Description",
      type: "text",
      rows: 3,
      description: "Overrides the description for social shares",
    }),
  ],
});
