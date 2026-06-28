import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemaTypes";

export default defineConfig({
  name: "default",
  title: "KapiLabs Studio",

  projectId: process.env.SANITY_STUDIO_PROJECT_ID || "fpiy84d7",
  dataset: process.env.SANITY_STUDIO_DATASET || "production",

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            // Site Settings singleton
            S.listItem()
              .title("Site Settings")
              .icon(() => "⚙️")
              .child(
                S.document()
                  .schemaType("siteSettings")
                  .documentId("siteSettings")
              ),

            // Theme Settings singleton
            S.listItem()
              .title("Theme Settings")
              .icon(() => "🎨")
              .child(
                S.document()
                  .schemaType("themeSettings")
                  .documentId("themeSettings")
              ),

            // Divider
            S.divider(),

            // All other document types (excluding singletons and plugin-grouped types)
            ...S.documentTypeListItems().filter((listItem) => {
              const id = listItem.getId() || "";
              return ![
                "siteSettings",
                "themeSettings",
                "globalSection",
                "savedSection",
                "testimonial",
                "testimonialSettings",
              ].includes(id);
            }),

            S.divider(),

            // Testimonials Plugin
            S.listItem()
              .title("Testimonials")
              .id("testimonials-plugin")
              .icon(() => "⭐")
              .child(
                S.list()
                  .title("Testimonials")
                  .items([
                    S.listItem()
                      .title("All Testimonials")
                      .icon(() => "⭐")
                      .child(S.documentTypeList("testimonial").title("All Testimonials")),
                    S.listItem()
                      .title("Google Reviews")
                      .icon(() => "🔵")
                      .child(
                        S.documentTypeList("testimonial")
                          .title("Google Reviews")
                          .filter('_type == "testimonial" && source == "google"')
                      ),
                    S.listItem()
                      .title("Yelp Reviews")
                      .icon(() => "🔴")
                      .child(
                        S.documentTypeList("testimonial")
                          .title("Yelp Reviews")
                          .filter('_type == "testimonial" && source == "yelp"')
                      ),
                    S.listItem()
                      .title("Facebook Reviews")
                      .icon(() => "🔵")
                      .child(
                        S.documentTypeList("testimonial")
                          .title("Facebook Reviews")
                          .filter('_type == "testimonial" && source == "facebook"')
                      ),
                    S.listItem()
                      .title("Custom Testimonials")
                      .icon(() => "✍️")
                      .child(
                        S.documentTypeList("testimonial")
                          .title("Custom Testimonials")
                          .filter('_type == "testimonial" && source == "custom"')
                      ),
                    S.listItem()
                      .title("Featured")
                      .icon(() => "🏅")
                      .child(
                        S.documentTypeList("testimonial")
                          .title("Featured Testimonials")
                          .filter('_type == "testimonial" && isFeatured == true')
                      ),
                    S.divider(),
                    S.listItem()
                      .title("Plugin Settings")
                      .icon(() => "⚙️")
                      .child(
                        S.document()
                          .schemaType("testimonialSettings")
                          .documentId("testimonialSettings")
                      ),
                  ])
              ),

            S.divider(),

            // Sections Library — create once, include anywhere
            S.listItem()
              .title("Sections Library")
              .id("sections-library")
              .icon(() => "🧩")
              .child(
                S.list()
                  .title("Sections Library")
                  .items([
                    S.listItem()
                      .title("Global Sections")
                      .icon(() => "🌐")
                      .child(S.documentTypeList("globalSection").title("Global Sections")),
                    S.listItem()
                      .title("Page Sections")
                      .icon(() => "📋")
                      .child(S.documentTypeList("savedSection").title("Page Sections")),
                  ])
              ),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
});
