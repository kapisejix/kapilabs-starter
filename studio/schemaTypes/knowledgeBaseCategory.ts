import { defineField, defineType } from "sanity";

export const knowledgeBaseCategoryType = defineType({
  name: "knowledgeBaseCategory",
  title: "KB Categories",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Category Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "icon",
      title: "Icon",
      type: "string",
      description: "Emoji or icon name",
    }),
    defineField({
      name: "parent",
      title: "Parent Category",
      type: "reference",
      to: [{ type: "knowledgeBaseCategory" }],
      description: "Leave empty for top-level categories",
    }),
    defineField({
      name: "order",
      title: "Sort Order",
      type: "number",
      initialValue: 0,
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
    }),
  ],
  orderings: [
    { title: "Sort Order", name: "order", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "parent->title",
      icon: "icon",
    },
    prepare({ title, subtitle, icon }) {
      return {
        title: title || "Untitled",
        subtitle: subtitle ? `Parent: ${subtitle}` : "Top-level",
        media: icon || undefined,
      };
    },
  },
});
