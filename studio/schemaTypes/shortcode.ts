import { defineField, defineType } from "sanity";

export const shortcodeType = defineType({
  name: "shortcode",
  title: "Shortcode",
  type: "object",
  fields: [
    defineField({ name: "name", title: "Shortcode Name", type: "string" }),
    defineField({ name: "attrs", title: "Attributes", type: "string" }),
  ],
  preview: { select: { title: "name", subtitle: "attrs" } },
});
