import { defineField, defineType } from "sanity";

export const globalSectionType = defineType({
  name: "globalSection",
  title: "Global Sections",
  type: "document",

  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "key",
      title: "Section Key",
      type: "string",
      description: "Unique key for programmatic lookup (e.g. announcement-bar, footer-cta, shared-testimonials)",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "sectionType",
      title: "Section Type",
      type: "string",
      options: {
        list: [
          { title: "Hero", value: "hero" },
          { title: "Services", value: "services" },
          { title: "Stats", value: "stats" },
          { title: "FAQ", value: "faq" },
          { title: "Team", value: "team" },
          { title: "Testimonials", value: "testimonials" },
          { title: "CTA", value: "cta" },
          { title: "HTML", value: "html" },
          { title: "Blog Preview", value: "blog-preview" },
          { title: "Contact", value: "contact" },
          { title: "Form", value: "form" },
          { title: "Announcement Bar", value: "announcement-bar" },
          { title: "Footer CTA", value: "footer-cta" },
        ],
      },
    }),

    // Simple content for Announcement Bar and Footer CTA (backward compatible)
    defineField({
      name: "content",
      title: "Simple Content",
      description: "Used for Announcement Bar and Footer CTA types",
      type: "object",
      fields: [
        defineField({ name: "heading", title: "Heading", type: "string" }),
        defineField({ name: "text", title: "Text", type: "text" }),
        defineField({ name: "buttonLabel", title: "Button Label", type: "string" }),
        defineField({ name: "buttonUrl", title: "Button URL", type: "string" }),
      ],
    }),

    // Rich section content for all 11 standard section types
    defineField({
      name: "sections",
      title: "Section Content",
      description: "For Hero, Services, Stats, FAQ, Team, Testimonials, CTA, HTML, Blog Preview, Contact, Form types — add one section",
      type: "array",
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
      ],
      validation: (Rule) => Rule.max(1),
    }),
  ],
});
