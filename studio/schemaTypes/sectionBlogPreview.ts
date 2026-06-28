import { defineField, defineType } from "sanity";
import { sectionSettingsFields } from "./shared/sectionSettings";

export const sectionBlogPreviewType = defineType({
  name: "sectionBlogPreview",
  title: "Blog Preview Section",
  type: "object",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "settings", title: "Settings" },
  ],
  fields: [
    defineField({ name: "heading", title: "Heading", type: "string", group: "content" }),
    defineField({ name: "limit", title: "Post Limit", type: "number", initialValue: 3, group: "content" }),
    ...sectionSettingsFields,
  ],
});
