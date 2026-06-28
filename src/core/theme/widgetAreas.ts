export type KapiWidgetArea =
  | "before-header"
  | "header-right"
  | "after-header"
  | "before-content"
  | "after-content"
  | "primary-sidebar"
  | "secondary-sidebar"
  | "footer-1"
  | "footer-2"
  | "footer-3"
  | "footer-4"
  | "top-bar-left"
  | "top-bar-right"
  | "header-left"
  | "blog-sidebar"
  | "page-sidebar"
  | "shop-sidebar"
  | "after-footer"
  | "off-canvas"
  | "mobile-menu";

export const widgetAreas: {
  name: KapiWidgetArea;
  label: string;
  description: string;
}[] = [
  {
    name: "before-header",
    label: "Before Header",
    description: "Region above the main site header.",
  },
  {
    name: "header-right",
    label: "Header Right",
    description: "Region on the right side of the header.",
  },
  {
    name: "after-header",
    label: "After Header",
    description: "Region below the main site header.",
  },
  {
    name: "before-content",
    label: "Before Content",
    description: "Region before the main content area.",
  },
  {
    name: "after-content",
    label: "After Content",
    description: "Region after the main content area.",
  },
  {
    name: "primary-sidebar",
    label: "Primary Sidebar",
    description: "Main sidebar region.",
  },
  {
    name: "secondary-sidebar",
    label: "Secondary Sidebar",
    description: "Secondary sidebar region.",
  },
  {
    name: "footer-1",
    label: "Footer 1",
    description: "First footer widget column.",
  },
  {
    name: "footer-2",
    label: "Footer 2",
    description: "Second footer widget column.",
  },
  {
    name: "footer-3",
    label: "Footer 3",
    description: "Third footer widget column.",
  },
  {
    name: "footer-4",
    label: "Footer 4",
    description: "Fourth footer widget column.",
  },
  {
    name: "top-bar-left",
    label: "Top Bar Left",
    description: "Left section of the top bar.",
  },
  {
    name: "top-bar-right",
    label: "Top Bar Right",
    description: "Right section of the top bar.",
  },
  {
    name: "header-left",
    label: "Header Left",
    description: "Left section of the header, before the logo.",
  },
  {
    name: "blog-sidebar",
    label: "Blog Sidebar",
    description: "Sidebar specifically for blog pages.",
  },
  {
    name: "page-sidebar",
    label: "Page Sidebar",
    description: "Sidebar specifically for regular pages.",
  },
  {
    name: "shop-sidebar",
    label: "Shop Sidebar",
    description: "Sidebar for shop/archive pages.",
  },
  {
    name: "after-footer",
    label: "After Footer",
    description: "Region below the main site footer.",
  },
  {
    name: "off-canvas",
    label: "Off-Canvas",
    description: "Off-canvas drawer panel.",
  },
  {
    name: "mobile-menu",
    label: "Mobile Menu",
    description: "Widgets shown inside the mobile menu panel.",
  },
];

export function isWidgetArea(name: string): name is KapiWidgetArea {
  return widgetAreas.some((area) => area.name === name);
}


