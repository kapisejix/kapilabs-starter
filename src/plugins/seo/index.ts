import type { KapiPlugin } from "../../core/plugins/types";
import {
  createWebsiteSchema,
  createOrganizationSchema,
  createArticleSchema,
  createBreadcrumbSchema,
  createFaqSchema,
  createHowToSchema,
  createPersonSchema,
  createServiceSchema,
  createEventSchema,
  createLocalBusinessSchema,
} from "../../core/seo/schema";

const seoPlugin: KapiPlugin = {
  name: "kapilabs-plugin-seo",
  label: "SEO Framework",
  version: "1.0.0",
  description: "Schema.org JSON-LD builders, sitemap, robots.txt, and meta tag utilities",

  register(ctx) {
    ctx.registerSchemaBuilder("website", createWebsiteSchema);
    ctx.registerSchemaBuilder("organization", createOrganizationSchema);
    ctx.registerSchemaBuilder("article", createArticleSchema);
    ctx.registerSchemaBuilder("breadcrumb", createBreadcrumbSchema);
    ctx.registerSchemaBuilder("faq", createFaqSchema);
    ctx.registerSchemaBuilder("howto", createHowToSchema);
    ctx.registerSchemaBuilder("person", createPersonSchema);
    ctx.registerSchemaBuilder("service", createServiceSchema);
    ctx.registerSchemaBuilder("event", createEventSchema);
    ctx.registerSchemaBuilder("localBusiness", createLocalBusinessSchema);
  },
};

export default seoPlugin;
