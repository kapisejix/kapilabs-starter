import { defineField, defineType } from "sanity";
import { sectionSettingsFields } from "./shared/sectionSettings";

export const sectionContactType = defineType({
  name: "sectionContact",
  title: "Contact Section",
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
      of: [{
        type: "block",
        styles: [{ title: "Normal", value: "normal" }],
        marks: {
          decorators: [
            { title: "Bold", value: "strong" },
            { title: "Italic", value: "em" },
            { title: "Underline", value: "underline" },
          ],
          annotations: [{
            name: "link", type: "object", title: "Link",
            fields: [
              { name: "href", type: "url", title: "URL" },
              { name: "blank", type: "boolean", title: "Open in new tab" },
            ],
          }],
        },
      }],
    }),
    defineField({ name: "phone", title: "Phone", type: "string", group: "content" }),
    defineField({ name: "email", title: "Email", type: "string", group: "content" }),
    defineField({ name: "address", title: "Address", type: "text", group: "content" }),
    ...sectionSettingsFields,
  ],
});
