export const defaultThemeSettings = {
  colors: {
    primary: "#111827",
    secondary: "#4f46e5",
    accent: "#f59e0b",
    background: "#ffffff",
    text: "#111827",
    muted: "#6b7280",
    border: "#e5e7eb",
    softBackground: "#f9fafb",
    surface: "#ffffff",
    link: "#2563eb",
    button: "#111827",
  },

  dark: {
    primary: "#ffffff",
    secondary: "#93c5fd",
    background: "#0f172a",
    text: "#e2e8f0",
    muted: "#94a3b8",
    border: "#1e293b",
    surface: "#1e293b",
  },

  typography: {
    fontFamily: "system-ui, sans-serif",
    headingFontFamily: "system-ui, sans-serif",
    baseFontSize: "16px",
    scale: "1.25",
    lineHeight: "1.6",
    headingLineHeight: "1.2",
    letterSpacing: "0",
    fontWeight: "400",
    headingFontWeight: "700",
  },

  layout: {
    containerWidth: "1200px",
    contentWidth: "760px",
    sidebarWidth: "320px",
    spacingScale: "normal",
  },

  buttons: {
    radius: "6px",
    style: "solid",
  },

  header: {
    sticky: false,
    showTopBar: true,
    layout: "logo-left-menu-right",
  },

  footer: {
    columns: 4,
    showCopyright: true,
    showFooterWidgets: true,
    copyrightText: "",
    footerCta: {
      label: "",
      url: "",
    },
    socialLinks: [],
  },

  blog: {
    showAuthor: true,
    showDate: true,
    showCategories: true,
    readingTime: false,
    excerptLength: 160,
    postsPerPage: 10,
  },
};
