import { defineField, defineType } from "sanity";
import { sectionSettingsFields } from "./shared/sectionSettings";

export const sectionHtmlType = defineType({
  name: "sectionHtml",
  title: "HTML Section",
  type: "object",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "settings", title: "Settings" },
  ],
  fields: [
    defineField({ name: "html", title: "HTML", type: "text", rows: 12, group: "content" }),
    ...sectionSettingsFields,
  ],
});
