import { defineField, defineType } from "sanity";

export const testimonialSettingsType = defineType({
  name: "testimonialSettings",
  title: "Testimonials Settings",
  type: "document",
  groups: [
    { name: "sources", title: "Review Sources", default: true },
    { name: "display", title: "Display Defaults" },
    { name: "filters", title: "Default Filters" },
    { name: "design", title: "Design" },
  ],
  fields: [
    // ── Google ─────────────────────────────────────────────────────────────
    defineField({
      name: "googleEnabled",
      title: "Enable Google Reviews",
      type: "boolean",
      group: "sources",
      initialValue: false,
    }),
    defineField({
      name: "googleApiKey",
      title: "Google Places API Key",
      type: "string",
      group: "sources",
      description: "From Google Cloud Console — Places API must be enabled",
    }),
    defineField({
      name: "googlePlaceId",
      title: "Google Place ID",
      type: "string",
      group: "sources",
      description: "Find via: maps.googleapis.com/maps/api/place/findplacefromtext",
    }),
    defineField({
      name: "googleMinRating",
      title: "Google: Minimum Rating to Import",
      type: "number",
      group: "sources",
      initialValue: 4,
      validation: (R) => R.min(1).max(5).integer(),
    }),

    // ── Yelp ────────────────────────────────────────────────────────────────
    defineField({
      name: "yelpEnabled",
      title: "Enable Yelp Reviews",
      type: "boolean",
      group: "sources",
      initialValue: false,
    }),
    defineField({
      name: "yelpApiKey",
      title: "Yelp Fusion API Key",
      type: "string",
      group: "sources",
      description: "From Yelp Developer portal — Fusion API",
    }),
    defineField({
      name: "yelpBusinessId",
      title: "Yelp Business ID / Alias",
      type: "string",
      group: "sources",
      description: "Business alias from the Yelp URL (e.g. my-business-name-city)",
    }),
    defineField({
      name: "yelpMinRating",
      title: "Yelp: Minimum Rating to Import",
      type: "number",
      group: "sources",
      initialValue: 4,
      validation: (R) => R.min(1).max(5).integer(),
    }),

    // ── Facebook ─────────────────────────────────────────────────────────────
    defineField({
      name: "facebookEnabled",
      title: "Enable Facebook Reviews",
      type: "boolean",
      group: "sources",
      initialValue: false,
    }),
    defineField({
      name: "facebookPageId",
      title: "Facebook Page ID",
      type: "string",
      group: "sources",
    }),
    defineField({
      name: "facebookAccessToken",
      title: "Facebook Access Token",
      type: "string",
      group: "sources",
      description: "Page access token with pages_read_engagement permission",
    }),
    defineField({
      name: "facebookMinRating",
      title: "Facebook: Minimum Rating to Import",
      type: "number",
      group: "sources",
      initialValue: 4,
      validation: (R) => R.min(1).max(5).integer(),
    }),

    // ── Display Defaults ─────────────────────────────────────────────────────
    defineField({
      name: "defaultLayout",
      title: "Default Layout",
      type: "string",
      group: "display",
      options: {
        list: [
          { title: "Grid", value: "grid" },
          { title: "Slider", value: "slider" },
          { title: "Horizontal Scroll", value: "scroll" },
        ],
        layout: "radio",
      },
      initialValue: "grid",
    }),
    defineField({
      name: "defaultColumns",
      title: "Default Grid Columns",
      type: "number",
      group: "display",
      initialValue: 3,
      validation: (R) => R.min(1).max(4).integer(),
    }),
    defineField({
      name: "showRating",
      title: "Show Star Rating",
      type: "boolean",
      group: "display",
      initialValue: true,
    }),
    defineField({
      name: "showSource",
      title: "Show Source Badge (Google / Yelp / etc.)",
      type: "boolean",
      group: "display",
      initialValue: true,
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

    // ── Default Filters ──────────────────────────────────────────────────────
    defineField({
      name: "minRating",
      title: "Minimum Rating to Display",
      type: "number",
      group: "filters",
      description: "Only display reviews at or above this rating (1 = show all, 4 = 4-5 stars only)",
      initialValue: 1,
      validation: (R) => R.min(1).max(5).integer(),
    }),
    defineField({
      name: "maxCharacters",
      title: "Character Limit per Review (0 = unlimited)",
      type: "number",
      group: "filters",
      initialValue: 0,
      validation: (R) => R.min(0).integer(),
    }),
    defineField({
      name: "showReadMore",
      title: "Show Read More for truncated reviews",
      type: "boolean",
      group: "filters",
      initialValue: true,
    }),

    // ── Design ──────────────────────────────────────────────────────────────
    defineField({
      name: "cardBgColor",
      title: "Card Background Color",
      type: "string",
      group: "design",
      description: "CSS color value (e.g. #ffffff, rgba(255,255,255,0.9))",
    }),
    defineField({
      name: "cardTextColor",
      title: "Card Text Color",
      type: "string",
      group: "design",
    }),
    defineField({
      name: "nameColor",
      title: "Client Name Color",
      type: "string",
      group: "design",
    }),
    defineField({
      name: "starColor",
      title: "Star Color",
      type: "string",
      group: "design",
      initialValue: "#f59e0b",
    }),
    defineField({
      name: "cardBorderColor",
      title: "Card Border Color",
      type: "string",
      group: "design",
    }),
    defineField({
      name: "cardBorderRadius",
      title: "Card Border Radius",
      type: "string",
      group: "design",
      description: "CSS value (e.g. 12px, 0.75rem)",
      initialValue: "12px",
    }),
    defineField({
      name: "shadowEnabled",
      title: "Enable Card Shadow",
      type: "boolean",
      group: "design",
      initialValue: true,
    }),
    defineField({
      name: "quoteIconColor",
      title: "Quote Icon Color",
      type: "string",
      group: "design",
      description: "CSS color for the opening quote mark decorator",
    }),
  ],
});
