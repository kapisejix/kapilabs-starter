import { defineField, defineType } from "sanity";

export const sectionRefType = defineType({
  name: "sectionRef",
  title: "Page Section",
  type: "object",
  fields: [
    defineField({
      name: "section",
      title: "Section",
      type: "reference",
      to: [{ type: "globalSection" }],
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "section.title",
      subtitle: "section.key",
    },
    prepare({ title, subtitle }: { title?: string; subtitle?: string }) {
      return {
        title: title || "Page Section",
        subtitle: subtitle ? `Key: ${subtitle}` : "No section selected",
      };
    },
  },
});
