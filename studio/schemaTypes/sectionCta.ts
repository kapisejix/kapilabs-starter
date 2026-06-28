import { defineField, defineType } from "sanity";
import { sectionSettingsFields } from "./shared/sectionSettings";

export const sectionCtaType = defineType({
  name: "sectionCta",
  title: "CTA Section",
  type: "object",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "settings", title: "Settings" },
  ],
  fields: [
    defineField({ name: "heading", title: "Heading", type: "string", group: "content" }),
    defineField({
      name: "text",
      title: "Text",
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
    defineField({ name: "buttonLabel", title: "Button Label", type: "string", group: "content" }),
    defineField({ name: "buttonUrl", title: "Button URL", type: "string", group: "content" }),
    ...sectionSettingsFields,
  ],
});
