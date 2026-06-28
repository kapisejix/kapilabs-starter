import { defineField } from "sanity";

/**
 * Shared section settings fields embedded in every section schema type.
 * Controls visual presentation: spacing, columns, background, animation, etc.
 */
export const sectionSettingsFields = [
  defineField({
    name: "settings",
    title: "Section Settings",
    type: "object",
    options: { collapsed: true, collapsible: true },
    fields: [
      defineField({
        name: "displayPreset",
        title: "Display Preset",
        type: "string",
        description: "How items are laid out within this section",
        options: {
          list: [
            { title: "Grid", value: "grid" },
            { title: "Cards", value: "cards" },
            { title: "List", value: "list" },
            { title: "Carousel", value: "carousel" },
            { title: "Masonry", value: "masonry" },
            { title: "Tabs", value: "tabs" },
            { title: "Accordion", value: "accordion" },
            { title: "Timeline", value: "timeline" },
            { title: "Minimal", value: "minimal" },
            { title: "Slider", value: "slider" },
            { title: "Scroll", value: "scroll" },
            { title: "Stack", value: "stack" },
          ],
          layout: "dropdown",
        },
        initialValue: "grid",
      }),
      defineField({
        name: "columns",
        title: "Columns",
        type: "number",
        description: "Number of grid columns (3 by default)",
        initialValue: 3,
        validation: (rule) => rule.min(1).max(6),
      }),
      defineField({
        name: "spacing",
        title: "Gap / Spacing",
        type: "string",
        description: "CSS gap value (e.g. 1.5rem, 24px, 2rem)",
        initialValue: "1.5rem",
      }),
      defineField({
        name: "containerWidth",
        title: "Container Width",
        type: "string",
        description: "Max-width for section content (e.g. 1200px, 100%)",
      }),
      defineField({
        name: "background",
        title: "Background Color",
        type: "string",
        description: "CSS background color value",
      }),
      defineField({
        name: "padding",
        title: "Padding",
        type: "string",
        description: "CSS padding (e.g. 4rem 0, 3rem)",
      }),
      defineField({
        name: "alignment",
        title: "Content Alignment",
        type: "string",
        options: {
          list: [
            { title: "Left", value: "left" },
            { title: "Center", value: "center" },
            { title: "Right", value: "right" },
          ],
          layout: "radio",
        },
        initialValue: "left",
      }),
      defineField({
        name: "animation",
        title: "Entrance Animation",
        type: "string",
        options: {
          list: [
            { title: "None", value: "none" },
            { title: "Fade In", value: "fadeIn" },
            { title: "Fade In Up", value: "fadeInUp" },
            { title: "Fade In Down", value: "fadeInDown" },
            { title: "Slide In Left", value: "slideInLeft" },
            { title: "Slide In Right", value: "slideInRight" },
            { title: "Zoom In", value: "zoomIn" },
          ],
          layout: "dropdown",
        },
        initialValue: "none",
      }),
      defineField({
        name: "cardStyle",
        title: "Card Style",
        type: "string",
        options: {
          list: [
            { title: "Default", value: "default" },
            { title: "Bordered", value: "bordered" },
            { title: "Elevated", value: "elevated" },
            { title: "Flat", value: "flat" },
            { title: "Gradient", value: "gradient" },
          ],
          layout: "dropdown",
        },
      }),
      defineField({
        name: "borderRadius",
        title: "Border Radius",
        type: "string",
        description: "CSS border-radius (e.g. 8px, 0.5rem, 999px)",
      }),
      defineField({
        name: "shadow",
        title: "Box Shadow",
        type: "string",
        description: "CSS box-shadow value",
      }),
      defineField({
        name: "overlay",
        title: "Overlay Color",
        type: "string",
        description: "Semi-transparent overlay color for hero sections with background images",
      }),
      defineField({
        name: "iconStyle",
        title: "Icon Style",
        type: "string",
        options: {
          list: [
            { title: "Default", value: "default" },
            { title: "Rounded", value: "rounded" },
            { title: "Outlined", value: "outlined" },
            { title: "Filled", value: "filled" },
          ],
          layout: "dropdown",
        },
      }),
      defineField({
        name: "buttonStyle",
        title: "Button Style",
        type: "string",
        options: {
          list: [
            { title: "Solid", value: "solid" },
            { title: "Outline", value: "outline" },
            { title: "Ghost", value: "ghost" },
          ],
          layout: "dropdown",
        },
      }),
      defineField({
        name: "cssClass",
        title: "CSS Class Name",
        type: "string",
        description: "Additional CSS class for the section wrapper",
      }),
      defineField({
        name: "sectionId",
        title: "Section ID",
        type: "string",
        description: "HTML id attribute for anchor linking (e.g. '#features')",
      }),
      defineField({
        name: "hideTitle",
        title: "Hide Section Title",
        type: "boolean",
        initialValue: false,
      }),
      defineField({
        name: "limit",
        title: "Max Items",
        type: "number",
        description: "Maximum number of items to display (0 = all)",
        initialValue: 0,
      }),
    ],
  }),
];
