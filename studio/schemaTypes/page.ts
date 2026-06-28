import { defineField, defineType } from "sanity";

export const pageType = defineType({
  name: "page",
  title: "Pages",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "seo", title: "SEO" },
    { name: "banner", title: "Banner" },
    { name: "settings", title: "Settings" },
    { name: "sections", title: "Sections" },
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
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
      group: "content",
    }),

    defineField({
      name: "featuredImage",
      title: "Featured Image",
      type: "image",
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
      name: "template",
      title: "Template",
      type: "string",
      group: "settings",
      options: {
        list: [
          { title: "Default", value: "default" },
          { title: "Landing", value: "landing" },
          { title: "Simple", value: "simple" },
        ],
      },
      initialValue: "default",
    }),

    defineField({
      name: "layout",
      title: "Layout",
      type: "string",
      group: "settings",
      options: {
        list: [
          { title: "Content / Sidebar", value: "content-sidebar" },
          { title: "Sidebar / Content", value: "sidebar-content" },
          { title: "Content / Sidebar / Sidebar", value: "content-sidebar-sidebar" },
          { title: "Sidebar / Sidebar / Content", value: "sidebar-sidebar-content" },
          { title: "Sidebar / Content / Sidebar", value: "sidebar-content-sidebar" },
          { title: "Full Width", value: "full-width-content" },
          { title: "Centered (Narrow)", value: "centered" },
          { title: "Blank (No Chrome)", value: "blank" },
        ],
      },
      initialValue: "content-sidebar",
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
        defineField({ name: "hideTitle", title: "Hide Page Title", type: "boolean", initialValue: false }),
        defineField({ name: "hideBreadcrumbs", title: "Hide Breadcrumbs", type: "boolean", initialValue: false }),
        defineField({ name: "hideFeaturedImage", title: "Hide Featured Image", type: "boolean", initialValue: false }),
      ],
    }),

    defineField({
      name: "layoutOverride",
      title: "Layout Override Settings",
      type: "object",
      group: "settings",
      options: { collapsed: true },
      fields: [
        defineField({ name: "containerWidth", title: "Container Width", type: "string", description: "e.g. 1200px, 100%" }),
        defineField({ name: "contentWidth", title: "Content Width", type: "string", description: "e.g. 760px, 65%" }),
        defineField({ name: "sidebarWidth", title: "Sidebar Width", type: "string", description: "e.g. 320px" }),
        defineField({ name: "sidebarSticky", title: "Sticky Sidebar", type: "boolean", initialValue: true }),
        defineField({ name: "gap", title: "Grid Gap", type: "string", description: "e.g. 24px, 2rem" }),
        defineField({ name: "padding", title: "Padding", type: "string", description: "e.g. 2rem 0" }),
        defineField({ name: "background", title: "Background", type: "string", description: "e.g. #ffffff, var(--color-soft-background)" }),
      ],
    }),

    defineField({
      name: "customBodyClass",
      title: "Custom Body CSS Class",
      type: "string",
      group: "settings",
    }),

    defineField({
      name: "animation",
      title: "Page Animation",
      type: "string",
      group: "settings",
    }),

    defineField({
      name: "anchorId",
      title: "Anchor ID",
      type: "string",
      group: "settings",
    }),

    defineField({
      name: "themePreset",
      title: "Theme Preset",
      type: "string",
      group: "settings",
      description: "Override theme preset for this page (e.g., 'dark', 'light')",
    }),

    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
      group: "seo",
    }),

    defineField({
      name: "sections",
      title: "Page Sections",
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
  ],
});
