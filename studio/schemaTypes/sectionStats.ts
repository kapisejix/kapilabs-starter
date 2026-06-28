import { defineField, defineType } from "sanity";
import { sectionSettingsFields } from "./shared/sectionSettings";

export const sectionStatsType = defineType({
  name: "sectionStats",
  title: "Stats Section",
  type: "object",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "settings", title: "Settings" },
  ],
  fields: [
    defineField({ name: "heading", title: "Heading", type: "string", group: "content" }),
    defineField({
      name: "items",
      title: "Stats",
      type: "array",
      group: "content",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "value", title: "Value", type: "string" }),
          defineField({ name: "label", title: "Label", type: "string" }),
        ],
      }],
    }),
    ...sectionSettingsFields,
  ],
});
