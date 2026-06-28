import { defaultThemeSettings } from "./defaultThemeSettings";

export function applyThemeSettings(settings: any = {}) {
  const theme = {
    ...defaultThemeSettings,
    ...settings,
    colors: {
      ...defaultThemeSettings.colors,
      ...(settings.colors || {}),
    },
    dark: {
      ...defaultThemeSettings.dark,
      ...(settings.dark || {}),
    },
    typography: {
      ...defaultThemeSettings.typography,
      ...(settings.typography || {}),
    },
    layout: {
      ...defaultThemeSettings.layout,
      ...(settings.layout || {}),
    },
    buttons: {
      ...defaultThemeSettings.buttons,
      ...(settings.buttons || {}),
    },
    header: {
      ...defaultThemeSettings.header,
      ...(settings.header || {}),
    },
    footer: {
      ...defaultThemeSettings.footer,
      ...(settings.footer || {}),
    },
    blog: {
      ...defaultThemeSettings.blog,
      ...(settings.blog || {}),
    },
  };

  return `
    :root {
      --color-primary: ${theme.colors.primary};
      --color-secondary: ${theme.colors.secondary};
      --color-accent: ${theme.colors.accent};
      --color-background: ${theme.colors.background};
      --color-text: ${theme.colors.text};
      --color-muted: ${theme.colors.muted};
      --color-border: ${theme.colors.border};
      --color-soft-background: ${theme.colors.softBackground};
      --color-surface: ${theme.colors.surface};
      --color-link: ${theme.colors.link};
      --color-button: ${theme.colors.button};

      --font-body: ${theme.typography.fontFamily};
      --font-heading: ${theme.typography.headingFontFamily};
      --font-size-base: ${theme.typography.baseFontSize};
      --line-height: ${theme.typography.lineHeight};
      --heading-line-height: ${theme.typography.headingLineHeight};
      --font-weight-body: ${theme.typography.fontWeight};
      --font-weight-heading: ${theme.typography.headingFontWeight};

      --container-width: ${theme.layout.containerWidth};
      --content-width: ${theme.layout.contentWidth};
      --sidebar-width: ${theme.layout.sidebarWidth};

      --button-radius: ${theme.buttons.radius};

      --dark-primary: ${theme.dark.primary};
      --dark-secondary: ${theme.dark.secondary};
      --dark-background: ${theme.dark.background};
      --dark-text: ${theme.dark.text};
      --dark-muted: ${theme.dark.muted};
      --dark-border: ${theme.dark.border};
      --dark-surface: ${theme.dark.surface};
    }
  `;
}
