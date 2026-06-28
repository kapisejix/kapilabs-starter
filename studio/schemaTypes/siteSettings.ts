import { defineField, defineType } from "sanity";

export const siteSettingsType = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  groups: [
    { name: "general", title: "General", default: true },
    { name: "social", title: "Social" },
    { name: "code", title: "Code" },
  ],
  fields: [
    defineField({ name: "siteTitle", title: "Site Title", type: "string", group: "general" }),
    defineField({ name: "tagline", title: "Tagline", type: "string", group: "general" }),

    defineField({
      name: "homepage",
      title: "Homepage",
      type: "reference",
      to: [{ type: "page" }],
      group: "general",
      description: "Page used as site homepage — equivalent to WordPress Reading Settings",
    }),

    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      group: "general",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", title: "Alt Text", type: "string" })],
    }),

    defineField({
      name: "darkLogo",
      title: "Dark Mode Logo",
      type: "image",
      group: "general",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", title: "Alt Text", type: "string" })],
      description: "Optional logo variant for dark mode",
    }),

    defineField({
      name: "favicon",
      title: "Favicon",
      type: "image",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", title: "Alt Text", type: "string" })],
      group: "general",
    }),

    defineField({ name: "phone", title: "Phone", type: "string", group: "general" }),
    defineField({ name: "email", title: "Email", type: "string", group: "general" }),
    defineField({ name: "address", title: "Address", type: "text", group: "general" }),

    defineField({
      name: "social",
      title: "Social Links",
      type: "object",
      group: "social",
      fields: [
        defineField({ name: "facebook", title: "Facebook", type: "string" }),
        defineField({ name: "instagram", title: "Instagram", type: "string" }),
        defineField({ name: "linkedin", title: "LinkedIn", type: "string" }),
        defineField({ name: "x", title: "X", type: "string" }),
      ],
    }),

    defineField({
      name: "customCode",
      title: "Custom Code",
      type: "object",
      group: "code",
      fields: [
        defineField({ name: "globalCss", title: "Global CSS", type: "text", rows: 6 }),
        defineField({ name: "globalHeaderScripts", title: "Global Header Scripts", type: "text", rows: 6 }),
        defineField({ name: "globalFooterScripts", title: "Global Footer Scripts", type: "text", rows: 6 }),
      ],
    }),
  ],
});
