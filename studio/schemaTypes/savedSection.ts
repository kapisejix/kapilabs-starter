import { defineField, defineType } from "sanity";

export const savedSectionType = defineType({
  name: "savedSection",
  title: "Saved Sections",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "metadata", title: "Metadata" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Section Title",
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
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      group: "metadata",
    }),

    defineField({
      name: "category",
      title: "Category",
      type: "string",
      description: "e.g., hero, cta, testimonials, features",
      group: "metadata",
    }),

    defineField({
      name: "sectionType",
      title: "Section Type",
      type: "string",
      validation: (Rule) => Rule.required(),
      options: {
        list: [
          { title: "Hero", value: "hero" },
          { title: "Content", value: "content" },
          { title: "Services", value: "services" },
          { title: "CTA", value: "cta" },
          { title: "Testimonials", value: "testimonials" },
          { title: "Stats", value: "stats" },
          { title: "FAQ", value: "faq" },
          { title: "Team", value: "team" },
          { title: "Blog Preview", value: "blog-preview" },
          { title: "Contact", value: "contact" },
          { title: "Form", value: "form" },
          { title: "HTML", value: "html" },
        ],
      },
      group: "metadata",
    }),

    defineField({
      name: "content",
      title: "Section Content",
      type: "object",
      group: "content",
      fields: [
        defineField({ name: "heading", title: "Heading", type: "string" }),
        defineField({ name: "text", title: "Text", type: "text", rows: 5 }),
        defineField({
          name: "image",
          title: "Image",
          type: "image",
          options: { hotspot: true },
        }),
        defineField({
          name: "items",
          title: "Items",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                defineField({ name: "title", title: "Title", type: "string" }),
                defineField({ name: "text", title: "Text", type: "text" }),
                defineField({ name: "icon", title: "Icon", type: "string" }),
                defineField({
                  name: "image",
                  title: "Image",
                  type: "image",
                  options: { hotspot: true },
                }),
              ],
            },
          ],
        }),
      ],
    }),

    defineField({
      name: "thumbnail",
      title: "Preview Thumbnail",
      type: "image",
      group: "metadata",
      options: { hotspot: true },
      description: "Thumbnail shown in the section library browser",
    }),

    defineField({
      name: "version",
      title: "Version",
      type: "number",
      initialValue: 1,
      group: "metadata",
    }),

    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Draft", value: "draft" },
          { title: "Published", value: "published" },
          { title: "Archived", value: "archived" },
        ],
      },
      initialValue: "draft",
      group: "metadata",
    }),
  ],

  preview: {
    select: {
      title: "title",
      subtitle: "sectionType",
      media: "thumbnail",
    },
  },
});
