import { defineField, defineType } from "sanity";
import { sectionSettingsFields } from "./shared/sectionSettings";

export const sectionTestimonialsType = defineType({
  name: "sectionTestimonials",
  title: "Testimonials Section",
  type: "object",
  groups: [
    { name: "content", title: "Inline Items", default: true },
    { name: "plugin", title: "Plugin / External Sources" },
    { name: "display", title: "Display Options" },
    { name: "settings", title: "Section Settings" },
  ],
  fields: [
    defineField({ name: "heading", title: "Heading", type: "string", group: "content" }),

    // ── Inline testimonials (existing behaviour) ──────────────────────────
    defineField({
      name: "items",
      title: "Inline Testimonials",
      type: "array",
      group: "content",
      description: "Quick inline entries — or use Plugin tab to pull from the Testimonials library",
      of: [{
        type: "object",
        fields: [
          defineField({
            name: "quote",
            title: "Quote",
            type: "array",
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
                  annotations: [
                    {
                      name: "link",
                      type: "object",
                      title: "Link",
                      fields: [
                        { name: "href", type: "url", title: "URL" },
                        { name: "blank", type: "boolean", title: "Open in new tab" },
                      ],
                    },
                  ],
                },
              },
            ],
          }),
          defineField({ name: "name", title: "Name", type: "string" }),
          defineField({ name: "role", title: "Role", type: "string" }),
          defineField({ name: "city", title: "City", type: "string" }),
          defineField({
            name: "avatar",
            title: "Avatar",
            type: "image",
            options: { hotspot: true },
            fields: [defineField({ name: "alt", type: "string", title: "Alt Text" })],
          }),
          defineField({
            name: "rating",
            title: "Rating (1–5)",
            type: "number",
            validation: (R) => R.min(1).max(5).integer(),
          }),
        ],
      }],
    }),

    // ── Plugin / External sources tab ─────────────────────────────────────
    defineField({
      name: "pluginSource",
      title: "Pull from Testimonials Library",
      type: "string",
      group: "plugin",
      description: "Auto-fetch from Testimonials documents (overrides inline items when set)",
      options: {
        list: [
          { title: "Disabled (use inline items)", value: "disabled" },
          { title: "All sources", value: "all" },
          { title: "Custom only", value: "custom" },
          { title: "Google Reviews only", value: "google" },
          { title: "Yelp only", value: "yelp" },
          { title: "Facebook only", value: "facebook" },
        ],
        layout: "dropdown",
      },
      initialValue: "disabled",
    }),
    defineField({
      name: "manualPick",
      title: "Manually Picked Testimonials",
      type: "array",
      group: "plugin",
      description: "Pick specific testimonials from the library (takes priority over auto-fetch)",
      of: [{ type: "reference", to: [{ type: "testimonial" }] }],
    }),
    defineField({
      name: "pluginMinRating",
      title: "Minimum Rating Filter",
      type: "number",
      group: "plugin",
      description: "Only show reviews at or above this rating (1 = all, 4 = 4–5 stars only)",
      initialValue: 1,
      validation: (R) => R.min(1).max(5).integer(),
    }),
    defineField({
      name: "pluginMaxCharacters",
      title: "Character Limit (0 = use global setting)",
      type: "number",
      group: "plugin",
      initialValue: 0,
      validation: (R) => R.min(0).integer(),
    }),
    defineField({
      name: "featuredOnly",
      title: "Featured testimonials only",
      type: "boolean",
      group: "plugin",
      initialValue: false,
    }),
    defineField({
      name: "itemLimit",
      title: "Max testimonials to show (0 = all)",
      type: "number",
      group: "plugin",
      initialValue: 0,
      validation: (R) => R.min(0).integer(),
    }),

    // ── Display Options tab ───────────────────────────────────────────────
    defineField({
      name: "showRating",
      title: "Show Star Rating",
      type: "boolean",
      group: "display",
      initialValue: true,
    }),
    defineField({
      name: "showSource",
      title: "Show Source Badge",
      type: "boolean",
      group: "display",
      initialValue: false,
    }),
    defineField({
      name: "showAvatar",
      title: "Show Avatar",
      type: "boolean",
      group: "display",
      initialValue: true,
    }),
    defineField({
      name: "showDate",
      title: "Show Review Date",
      type: "boolean",
      group: "display",
      initialValue: false,
    }),
    defineField({
      name: "showCity",
      title: "Show City",
      type: "boolean",
      group: "display",
      initialValue: true,
    }),
    defineField({
      name: "showVideo",
      title: "Show Video Testimonials",
      type: "boolean",
      group: "display",
      initialValue: true,
    }),
    defineField({
      name: "designOverride",
      title: "Design Override",
      type: "object",
      group: "display",
      options: { collapsed: true, collapsible: true },
      fields: [
        defineField({ name: "cardBgColor", title: "Card Background", type: "string" }),
        defineField({ name: "cardTextColor", title: "Card Text Color", type: "string" }),
        defineField({ name: "nameColor", title: "Name Color", type: "string" }),
        defineField({ name: "starColor", title: "Star Color", type: "string" }),
        defineField({ name: "cardBorderColor", title: "Border Color", type: "string" }),
        defineField({ name: "cardBorderRadius", title: "Border Radius (e.g. 12px)", type: "string" }),
        defineField({ name: "shadowEnabled", title: "Card Shadow", type: "boolean" }),
      ],
    }),

    ...sectionSettingsFields,
  ],
});
