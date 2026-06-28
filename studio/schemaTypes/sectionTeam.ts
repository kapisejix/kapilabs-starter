import { defineField, defineType } from "sanity";
import { sectionSettingsFields } from "./shared/sectionSettings";

export const sectionTeamType = defineType({
  name: "sectionTeam",
  title: "Team Section",
  type: "object",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "settings", title: "Settings" },
  ],
  fields: [
    defineField({ name: "heading", title: "Heading", type: "string", group: "content" }),
    defineField({
      name: "items",
      title: "Team Members",
      type: "array",
      group: "content",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "name", title: "Name", type: "string" }),
          defineField({ name: "role", title: "Role", type: "string" }),
          defineField({ name: "image", title: "Image URL", type: "string" }),
          defineField({
            name: "bio",
            title: "Bio",
            type: "array",
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
        ],
      }],
    }),
    ...sectionSettingsFields,
  ],
});
