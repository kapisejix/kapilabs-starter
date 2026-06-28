import { defineField, defineType } from "sanity";

export const postType = defineType({
  name: "post",
  title: "Posts",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "sections", title: "Sections" },
    { name: "seo", title: "SEO" },
    { name: "banner", title: "Banner" },
    { name: "settings", title: "Settings" },
  ],

  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
      group: "content",
    }),

    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "content",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "featuredImage",
      title: "Featured Image",
      type: "image",
      group: "content",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt Text",
          type: "string",
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),

    defineField({
      name: "banner",
      title: "Banner",
      type: "object",
      group: "banner",
      fields: [
        defineField({
          name: "heading",
          title: "Banner Heading",
          type: "string",
        }),
        defineField({
          name: "text",
          title: "Banner Text",
          type: "text",
          rows: 3,
        }),
        defineField({
          name: "image",
          title: "Banner Image",
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alt Text",
              type: "string",
            }),
          ],
        }),
        defineField({
          name: "overlay",
          title: "Banner Overlay",
          type: "boolean",
          initialValue: true,
        }),
        defineField({
          name: "alignment",
          title: "Banner Alignment",
          type: "string",
          options: {
            list: [
              { title: "Left", value: "left" },
              { title: "Center", value: "center" },
              { title: "Right", value: "right" },
            ],
          },
          initialValue: "center",
        }),
      ],
    }),

    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
      group: "content",
    }),

    defineField({
      name: "publishedAt",
      title: "Published Date",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      group: "settings",
    }),

    defineField({
      name: "categories",
      title: "Categories",
      type: "array",
      of: [{ type: "string" }],
      group: "content",
    }),

    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      group: "content",
    }),

    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
      group: "seo",
    }),

    defineField({
      name: "content",
      title: "Rich Content",
      type: "array",
      group: "content",
      of: [
        { type: "block" },
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({ name: "alt", title: "Alt Text", type: "string" }),
            defineField({ name: "caption", title: "Caption", type: "string" }),
          ],
        },
        { type: "shortcode" },
        { type: "sectionRef" },
        {
          name: "codeBlock",
          title: "Code Block",
          type: "object",
          fields: [
            defineField({ name: "code", title: "Code", type: "text", rows: 12 }),
            defineField({
              name: "language",
              title: "Language",
              type: "string",
              options: {
                list: [
                  { title: "Plain Text", value: "text" },
                  { title: "HTML", value: "html" },
                  { title: "CSS", value: "css" },
                  { title: "JavaScript", value: "javascript" },
                  { title: "TypeScript", value: "typescript" },
                  { title: "JSON", value: "json" },
                  { title: "Python", value: "python" },
                  { title: "Shell/Bash", value: "bash" },
                  { title: "SQL", value: "sql" },
                  { title: "YAML", value: "yaml" },
                  { title: "Markdown", value: "markdown" },
                ],
              },
            }),
          ],
          preview: {
            select: { title: "language", subtitle: "code" },
          },
        },
      ],
    }),

    defineField({
      name: "sections",
      title: "Post Sections",
      type: "array",
      group: "sections",
      of: [
        { type: "sectionHero" },
        { type: "sectionServices" },
        { type: "sectionStats" },
        { type: "sectionFaq" },
        { type: "sectionTeam" },
        { type: "sectionTestimonials" },
        { type: "sectionCta" },
        { type: "sectionHtml" },
        { type: "sectionBlogPreview" },
        { type: "sectionContact" },
        { type: "sectionForm" },
        { type: "sectionRef" },
      ],
    }),

    defineField({
      name: "customCode",
      title: "Custom Code",
      type: "object",
      group: "settings",
      fields: [
        defineField({ name: "customCss", title: "Custom CSS", type: "text", rows: 6 }),
        defineField({ name: "headerScripts", title: "Header Scripts", type: "text", rows: 6 }),
        defineField({ name: "footerScripts", title: "Footer Scripts", type: "text", rows: 6 }),
      ],
    }),

    defineField({
      name: "visibility",
      title: "Visibility Overrides",
      type: "object",
      group: "settings",
      options: { collapsed: true },
      fields: [
        defineField({ name: "hideHeader", title: "Hide Header", type: "boolean", initialValue: false }),
        defineField({ name: "hideFooter", title: "Hide Footer", type: "boolean", initialValue: false }),
        defineField({ name: "hideSidebar", title: "Hide Sidebar", type: "boolean", initialValue: false }),
        defineField({ name: "hideTitle", title: "Hide Post Title", type: "boolean", initialValue: false }),
        defineField({ name: "hideBreadcrumbs", title: "Hide Breadcrumbs", type: "boolean", initialValue: false }),
        defineField({ name: "hideFeaturedImage", title: "Hide Featured Image", type: "boolean", initialValue: false }),
      ],
    }),

    defineField({
      name: "customBodyClass",
      title: "Custom Body CSS Class",
      type: "string",
      group: "settings",
    }),

    defineField({
      name: "themePreset",
      title: "Theme Preset",
      type: "string",
      group: "settings",
      description: "Override theme preset for this post (e.g., 'dark', 'light')",
    }),
  ],
});
