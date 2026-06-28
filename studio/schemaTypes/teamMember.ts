import { defineField, defineType } from "sanity";

export const teamMemberType = defineType({
  name: "teamMember",
  title: "Team Members",
  type: "document",
  groups: [
    { name: "profile", title: "Profile", default: true },
    { name: "social", title: "Social" },
  ],

  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
      group: "profile",
    }),

    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name" },
      validation: (Rule) => Rule.required(),
      group: "profile",
    }),

    defineField({
      name: "role",
      title: "Role",
      type: "string",
      group: "profile",
    }),

    defineField({
      name: "photo",
      title: "Photo",
      type: "image",
      group: "profile",
      options: { hotspot: true },
      fields: [
        defineField({ name: "alt", title: "Alt Text", type: "string" }),
        defineField({ name: "caption", title: "Caption", type: "string" }),
        defineField({ name: "credit", title: "Credit", type: "string" }),
      ],
    }),

    defineField({
      name: "bio",
      title: "Bio",
      type: "text",
      group: "profile",
    }),

    defineField({
      name: "email",
      title: "Email",
      type: "string",
      group: "social",
    }),

    defineField({
      name: "website",
      title: "Website",
      type: "url",
      group: "social",
    }),

    defineField({
      name: "linkedin",
      title: "LinkedIn",
      type: "url",
      group: "social",
    }),

    defineField({
      name: "twitter",
      title: "Twitter/X",
      type: "url",
      group: "social",
    }),

    defineField({
      name: "github",
      title: "GitHub",
      type: "url",
      group: "social",
    }),
  ],
});
