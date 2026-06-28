import { defineField, defineType } from "sanity";

export const knowledgeBaseArticleType = defineType({
  name: "knowledgeBaseArticle",
  title: "KB Articles",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "seo", title: "SEO" },
    { name: "settings", title: "Settings" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Article Title",
      type: "string",
      validation: (Rule) => Rule.required(),
      group: "content",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 120 },
      validation: (Rule) => Rule.required(),
      group: "content",
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt / Summary",
      type: "text",
      rows: 3,
      group: "content",
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "knowledgeBaseCategory" }],
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
      name: "featured",
      title: "Featured Article",
      type: "boolean",
      initialValue: false,
      group: "settings",
    }),
    defineField({
      name: "content",
      title: "Article Content",
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
                ],
              },
            }),
          ],
        },
      ],
    }),
    defineField({
      name: "relatedArticles",
      title: "Related Articles",
      type: "array",
      of: [{ type: "reference", to: [{ type: "knowledgeBaseArticle" }] }],
      group: "settings",
      description: "Manually select related articles. Auto-populated if empty.",
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      to: [{ type: "teamMember" }],
      group: "settings",
    }),
    defineField({
      name: "publishedAt",
      title: "Published Date",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      group: "settings",
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
      group: "seo",
    }),
  ],
  orderings: [
    { title: "Published Date", name: "date", by: [{ field: "publishedAt", direction: "desc" }] },
    { title: "Title", name: "title", by: [{ field: "title", direction: "asc" }] },
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "category->title",
      featured: "featured",
    },
    prepare({ title, subtitle, featured }) {
      return {
        title: title || "Untitled",
        subtitle: featured ? `⭐ Featured — ${subtitle || "Uncategorized"}` : subtitle || "Uncategorized",
      };
    },
  },
});
