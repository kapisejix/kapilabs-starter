import type { KapiPlugin } from "../../core/plugins/types";

const testimonialsPlugin: KapiPlugin = {
  name: "kapilabs-plugin-testimonials",
  label: "Testimonials",
  version: "1.0.0",
  description:
    "Standalone testimonials with external review sources (Google, Yelp, Facebook), " +
    "custom testimonials with video support, and flexible grid/slider/scroll display. " +
    "Managed under Testimonials in Sanity Studio sidebar.",

  register(ctx) {
    // Shortcode: [kapi_testimonials_plugin layout="grid" source="all" min_rating="4" limit="6"]
    ctx.registerShortcode("kapi_testimonials_plugin", (attrs) => {
      const layout = attrs.layout || "grid";
      const source = attrs.source || "all";
      const minRating = attrs.min_rating || "1";
      const limit = attrs.limit || "6";
      const featuredOnly = attrs.featured_only === "true" ? "true" : "false";
      return (
        `<div class="testimonials-plugin-embed" ` +
        `data-layout="${layout}" ` +
        `data-source="${source}" ` +
        `data-min-rating="${minRating}" ` +
        `data-limit="${limit}" ` +
        `data-featured-only="${featuredOnly}">` +
        `</div>`
      );
    });
  },
};

export default testimonialsPlugin;
