import { defineField, defineType } from "sanity";

export const testimonialType = defineType({
  name: "testimonial",
  title: "Testimonials",
  type: "document",
  groups: [
    { name: "client", title: "Client Info", default: true },
    { name: "content", title: "Content" },
    { name: "source", title: "Source & Rating" },
    { name: "status", title: "Status" },
  ],
  fields: [
    // Client Info
    defineField({
      name: "clientName",
      title: "Client Name",
      type: "string",
      group: "client",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "city",
      title: "City",
      type: "string",
      group: "client",
    }),
    defineField({
      name: "role",
      title: "Role / Title",
      type: "string",
      group: "client",
    }),
    defineField({
      name: "company",
      title: "Company",
      type: "string",
      group: "client",
    }),
    defineField({
      name: "avatar",
      title: "Avatar",
      type: "image",
      group: "client",
      options: { hotspot: true },
      fields: [
        defineField({ name: "alt", title: "Alt Text", type: "string" }),
      ],
    }),

    // Content
    defineField({
      name: "testimonialText",
      title: "Testimonial Text",
      type: "array",
      group: "content",
      of: [
        {
          type: "block",
          styles: [{ title: "Normal", value: "normal" }],
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
              { title: "Underline", value: "underline" },
            ],
            annotations: [],
          },
        },
      ],
    }),
    defineField({
      name: "videoUrl",
      title: "Video Testimonial URL",
      type: "url",
      group: "content",
      description: "YouTube or Vimeo URL (e.g. https://youtube.com/watch?v=xxx)",
    }),
    defineField({
      name: "videoType",
      title: "Video Type",
      type: "string",
      group: "content",
      options: {
        list: [
          { title: "YouTube", value: "youtube" },
          { title: "Vimeo", value: "vimeo" },
        ],
        layout: "radio",
      },
    }),

    // Source & Rating
    defineField({
      name: "source",
      title: "Source",
      type: "string",
      group: "source",
      options: {
        list: [
          { title: "Custom (manual entry)", value: "custom" },
          { title: "Google Reviews", value: "google" },
          { title: "Yelp", value: "yelp" },
          { title: "Facebook", value: "facebook" },
        ],
        layout: "radio",
      },
      initialValue: "custom",
    }),
    defineField({
      name: "rating",
      title: "Rating (1–5 stars)",
      type: "number",
      group: "source",
      validation: (R) => R.min(1).max(5).integer(),
    }),
    defineField({
      name: "reviewDate",
      title: "Review Date",
      type: "date",
      group: "source",
    }),
    defineField({
      name: "externalUrl",
      title: "Original Review URL",
      type: "url",
      group: "source",
      description: "Link to the review on Google, Yelp, or Facebook",
    }),
    defineField({
      name: "externalId",
      title: "External Review ID",
      type: "string",
      group: "source",
      description: "ID from the external platform — used for deduplication during API sync",
    }),

    // Status
    defineField({
      name: "isPublished",
      title: "Published",
      type: "boolean",
      group: "status",
      initialValue: true,
    }),
    defineField({
      name: "isFeatured",
      title: "Featured (show first)",
      type: "boolean",
      group: "status",
      initialValue: false,
    }),
  ],

  preview: {
    select: {
      title: "clientName",
      subtitle: "source",
      rating: "rating",
      media: "avatar",
    },
    prepare({ title, subtitle, rating, media }) {
      const filled = rating ? Math.round(Number(rating)) : 0;
      const stars = "★".repeat(filled) + "☆".repeat(Math.max(0, 5 - filled));
      return {
        title: title || "Unnamed Testimonial",
        subtitle: `${subtitle || "custom"} ${stars}`.trim(),
        media,
      };
    },
  },
});
