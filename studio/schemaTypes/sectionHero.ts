import { defineField, defineType } from "sanity";
import { sectionSettingsFields } from "./shared/sectionSettings";

export const sectionHeroType = defineType({
  name: "sectionHero",
  title: "Hero Section",
  type: "object",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "media", title: "Media" },
    { name: "buttons", title: "Buttons" },
    { name: "settings", title: "Settings" },
  ],
  fields: [
    defineField({ name: "type", type: "string", initialValue: "hero", hidden: true, group: "content" }),
    defineField({ name: "eyebrow", title: "Eyebrow Text", type: "string", group: "content" }),
    defineField({ name: "heading", title: "Heading", type: "string", group: "content" }),
    defineField({ name: "subheading", title: "Subheading", type: "string", group: "content" }),
    defineField({
      name: "text",
      title: "Body Text",
      type: "array",
      group: "content",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "Heading 2", value: "h2" },
            { title: "Heading 3", value: "h3" },
            { title: "Heading 4", value: "h4" },
            { title: "Quote", value: "blockquote" },
          ],
          lists: [
            { title: "Bullet", value: "bullet" },
            { title: "Numbered", value: "number" },
          ],
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
              { title: "Underline", value: "underline" },
              { title: "Strike", value: "strike-through" },
              { title: "Code", value: "code" },
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
              {
                name: "highlight",
                type: "object",
                title: "Highlight Color",
                fields: [
                  { name: "color", type: "string", title: "Color", description: "CSS value, e.g. #fbbf24" },
                ],
              },
            ],
          },
        },
      ],
    }),
    defineField({
      name: "alignment",
      title: "Content Alignment",
      type: "string",
      group: "content",
      options: {
        list: [
          { title: "Left", value: "left" },
          { title: "Center", value: "center" },
          { title: "Right", value: "right" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "center",
    }),

    // ── Media ──
    defineField({
      name: "image",
      title: "Foreground Image",
      type: "image",
      group: "media",
      description: "Image displayed alongside hero content (not the background).",
      options: { hotspot: true },
      fields: [
        defineField({ name: "alt", title: "Alt Text", type: "string" }),
        defineField({ name: "caption", title: "Caption", type: "string" }),
      ],
    }),
    defineField({
      name: "backgroundImage",
      title: "Background Image",
      type: "image",
      group: "media",
      description: "Full-bleed background image behind all hero content.",
      options: { hotspot: true },
      fields: [
        defineField({ name: "alt", title: "Alt Text", type: "string" }),
      ],
    }),
    defineField({
      name: "backgroundPosition",
      title: "Background Image Position",
      type: "string",
      group: "media",
      options: {
        list: [
          { title: "Center", value: "center center" },
          { title: "Top", value: "center top" },
          { title: "Bottom", value: "center bottom" },
          { title: "Left", value: "left center" },
          { title: "Right", value: "right center" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "center center",
    }),
    defineField({
      name: "backgroundOverlay",
      title: "Dark Overlay on Background",
      type: "boolean",
      group: "media",
      description: "Add dark overlay over background image to improve text readability.",
      initialValue: true,
    }),
    defineField({
      name: "overlayOpacity",
      title: "Overlay Opacity (%)",
      type: "number",
      group: "media",
      description: "0 = transparent · 100 = fully dark. Only applies when overlay is enabled.",
      validation: (Rule) => Rule.min(0).max(100),
      initialValue: 50,
    }),
    defineField({
      name: "backgroundVideo",
      title: "Background Video URL",
      type: "url",
      group: "media",
      description: "Direct mp4 URL. Plays muted/looped behind hero content. Background image acts as poster frame.",
    }),

    // ── Buttons ──
    defineField({ name: "buttonLabel", title: "Primary Button Label", type: "string", group: "buttons" }),
    defineField({ name: "buttonUrl", title: "Primary Button URL", type: "string", group: "buttons" }),
    defineField({
      name: "buttonStyle",
      title: "Primary Button Style",
      type: "string",
      group: "buttons",
      options: {
        list: [
          { title: "Solid", value: "solid" },
          { title: "Outline", value: "outline" },
          { title: "Ghost", value: "ghost" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "solid",
    }),
    defineField({
      name: "buttonTargetBlank",
      title: "Open Primary Button in New Tab",
      type: "boolean",
      group: "buttons",
      initialValue: false,
    }),
    defineField({ name: "secondaryButtonLabel", title: "Secondary Button Label", type: "string", group: "buttons" }),
    defineField({ name: "secondaryButtonUrl", title: "Secondary Button URL", type: "string", group: "buttons" }),
    defineField({
      name: "secondaryButtonStyle",
      title: "Secondary Button Style",
      type: "string",
      group: "buttons",
      options: {
        list: [
          { title: "Solid", value: "solid" },
          { title: "Outline", value: "outline" },
          { title: "Ghost", value: "ghost" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "outline",
    }),
    defineField({
      name: "secondaryButtonTargetBlank",
      title: "Open Secondary Button in New Tab",
      type: "boolean",
      group: "buttons",
      initialValue: false,
    }),

    ...sectionSettingsFields,
  ],
});
