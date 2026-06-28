import { defineField, defineType } from "sanity";

const menuItemFields = [
  defineField({
    name: "label",
    title: "Label Override",
    type: "string",
    description: "Optional. If empty, KapiLabs uses the selected content title.",
  }),

  defineField({
    name: "itemType",
    title: "Item Type",
    type: "string",
    options: {
      list: [
        { title: "Custom URL", value: "custom" },
        { title: "Page", value: "page" },
        { title: "Post", value: "post" },
        { title: "Team Member", value: "teamMember" },
        { title: "Category", value: "category" },
        { title: "Tag", value: "tag" },
        { title: "Button", value: "button" },
        { title: "Anchor Link", value: "anchor" },
        { title: "Section Embed", value: "section" },
      ],
    },
    initialValue: "custom",
  }),

  defineField({
    name: "url",
    title: "Custom URL",
    type: "string",
    hidden: ({ parent }) => parent?.itemType !== "custom",
  }),

  defineField({
    name: "page",
    title: "Page",
    type: "reference",
    to: [{ type: "page" }],
    hidden: ({ parent }) => parent?.itemType !== "page",
  }),

  defineField({
    name: "post",
    title: "Post",
    type: "reference",
    to: [{ type: "post" }],
    hidden: ({ parent }) => parent?.itemType !== "post",
  }),

  defineField({
    name: "teamMember",
    title: "Team Member",
    type: "reference",
    to: [{ type: "teamMember" }],
    hidden: ({ parent }) => parent?.itemType !== "teamMember",
  }),

  defineField({
    name: "category",
    title: "Category",
    type: "string",
    hidden: ({ parent }) => parent?.itemType !== "category",
  }),

  defineField({
    name: "tag",
    title: "Tag",
    type: "string",
    hidden: ({ parent }) => parent?.itemType !== "tag",
  }),

  defineField({
    name: "description",
    title: "Description",
    type: "string",
  }),

  defineField({
    name: "icon",
    title: "Icon",
    type: "string",
  }),

  defineField({
    name: "cssClass",
    title: "CSS Class",
    type: "string",
  }),

  defineField({
    name: "targetBlank",
    title: "Open In New Tab",
    type: "boolean",
    initialValue: false,
  }),

  defineField({
    name: "badge",
    title: "Badge Text",
    type: "string",
    description: "e.g., 'New', 'Hot', 'Sale'",
  }),

  defineField({
    name: "nofollow",
    title: "No Follow Link",
    type: "boolean",
    initialValue: false,
    description: "Add rel='nofollow' to this link",
  }),

  defineField({
    name: "animation",
    title: "Animation",
    type: "string",
    description: "e.g., 'fadeIn 0.3s', 'slideIn 0.5s'",
  }),

  defineField({
    name: "visibility",
    title: "Visibility",
    type: "string",
    options: {
      list: [
        { title: "Visible", value: "visible" },
        { title: "Hidden", value: "hidden" },
      ],
    },
    initialValue: "visible",
  }),

  defineField({
    name: "isMegaMenu",
    title: "Enable Mega Menu",
    type: "boolean",
    initialValue: false,
    description: "Display child items in a multi-column grid layout",
  }),

  defineField({
    name: "megaMenuColumns",
    title: "Mega Menu Columns",
    type: "number",
    initialValue: 3,
    hidden: ({ parent }) => !parent?.isMegaMenu,
  }),

  defineField({
    name: "children",
    title: "Child Menu Items",
    type: "array",
    of: [
      {
        type: "object",
        fields: [
          defineField({
            name: "label",
            title: "Label Override",
            type: "string",
          }),
          defineField({
            name: "itemType",
            title: "Item Type",
            type: "string",
            options: {
              list: [
                { title: "Custom URL", value: "custom" },
                { title: "Page", value: "page" },
                { title: "Post", value: "post" },
                { title: "Team Member", value: "teamMember" },
                { title: "Category", value: "category" },
                { title: "Tag", value: "tag" },
              ],
            },
            initialValue: "custom",
          }),
          defineField({
            name: "url",
            title: "Custom URL",
            type: "string",
            hidden: ({ parent }) => parent?.itemType !== "custom",
          }),
          defineField({
            name: "page",
            title: "Page",
            type: "reference",
            to: [{ type: "page" }],
            hidden: ({ parent }) => parent?.itemType !== "page",
          }),
          defineField({
            name: "post",
            title: "Post",
            type: "reference",
            to: [{ type: "post" }],
            hidden: ({ parent }) => parent?.itemType !== "post",
          }),
          defineField({
            name: "teamMember",
            title: "Team Member",
            type: "reference",
            to: [{ type: "teamMember" }],
            hidden: ({ parent }) => parent?.itemType !== "teamMember",
          }),
          defineField({
            name: "category",
            title: "Category",
            type: "string",
            hidden: ({ parent }) => parent?.itemType !== "category",
          }),
          defineField({
            name: "tag",
            title: "Tag",
            type: "string",
            hidden: ({ parent }) => parent?.itemType !== "tag",
          }),
          defineField({ name: "description", title: "Description", type: "string" }),
          defineField({ name: "icon", title: "Icon", type: "string" }),
          defineField({ name: "cssClass", title: "CSS Class", type: "string" }),
          defineField({
            name: "targetBlank",
            title: "Open In New Tab",
            type: "boolean",
            initialValue: false,
          }),
        ],
        preview: {
          select: {
            title: "label",
            subtitle: "itemType",
          },
        },
      },
    ],
  }),
];

export const menuType = defineType({
  name: "menu",
  title: "Menus",
  type: "document",

  fields: [
    defineField({
      name: "name",
      title: "Menu Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "location",
      title: "Menu Location",
      type: "string",
      options: {
        list: [
          { title: "Primary", value: "primary" },
          { title: "Secondary", value: "secondary" },
          { title: "Footer", value: "footer" },
          { title: "Mobile", value: "mobile" },
          { title: "Utility", value: "utility" },
          { title: "Top Bar", value: "top-bar" },
          { title: "Social", value: "social" },
          { title: "Legal", value: "legal" },
          { title: "Sidebar", value: "sidebar" },
          { title: "Off-Canvas", value: "off-canvas" },
        ],
      },
      initialValue: "primary",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "items",
      title: "Menu Items",
      type: "array",
      of: [
        {
          type: "object",
          fields: menuItemFields,
          preview: {
            select: {
              title: "label",
              subtitle: "itemType",
            },
          },
        },
      ],
    }),
  ],
});
