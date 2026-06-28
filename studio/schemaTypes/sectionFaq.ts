import { defineField, defineType } from "sanity";
import { sectionSettingsFields } from "./shared/sectionSettings";

export const sectionFaqType = defineType({
  name: "sectionFaq",
  title: "FAQ Section",
  type: "object",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "settings", title: "Settings" },
  ],
  fields: [
    defineField({ name: "heading", title: "Heading", type: "string", group: "content" }),
    defineField({
      name: "items",
      title: "FAQs",
      type: "array",
      group: "content",
      of: [{
        type: "object", fields: [
          defineField({ name: "question", title: "Question", type: "string" }),
          defineField({
            name: "answer",
            title: "Answer",
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
        ],
      }],
    }),
    ...sectionSettingsFields,
  ],
});
