/**
 * Kapi Theme Export — serialize theme configuration to JSON.
 *
 * Usage:
 *   import { exportTheme } from "@kapi/theme/export-import/export";
 *   const json = await exportTheme();
 */

import type { CmsThemeSettings, CmsSiteSettings, CmsMenu, CmsWidget } from "@kapi/cms/types";
import {
  getThemeSettings,
  getSiteSettings,
  getMenu,
  getWidgets,
} from "@kapi/cms";

export type KapiThemeExport = {
  /** Schema version for compatibility checking */
  schemaVersion: number;
  /** When this export was created */
  exportedAt: string;
  /** The source site title */
  siteTitle: string;
  /** Theme settings + design tokens */
  theme: CmsThemeSettings | null;
  /** Site settings (logo, contact info) */
  site: Partial<CmsSiteSettings> | null;
  /** Menu definitions keyed by name */
  menus: Record<string, CmsMenu | null>;
  /** Widget definitions keyed by area */
  widgets: Record<string, CmsWidget[]>;
};

/**
 * Export all theme configuration to a JSON-serializable object.
 */
export async function exportTheme(): Promise<KapiThemeExport> {
  const [themeSettings, siteSettings] = await Promise.all([
    getThemeSettings(),
    getSiteSettings(),
  ]);

  // Fetch all known menus
  const menuNames = ["primary", "secondary", "footer", "mobile", "utility"];
  const menuEntries = await Promise.all(
    menuNames.map(async (name) => {
      const menu = await getMenu(name);
      return [name, menu] as const;
    })
  );
  const menus: Record<string, CmsMenu | null> = {};
  for (const [name, menu] of menuEntries) {
    menus[name] = menu;
  }

  // Fetch widgets from known areas
  const widgetAreas = [
    "primary-sidebar", "secondary-sidebar", "footer-1", "footer-2", "footer-3",
    "before-header", "after-header", "before-content", "after-content", "header-right",
  ] as any[];
  const widgetEntries = await Promise.all(
    widgetAreas.map(async (area) => {
      const widgets = await getWidgets(area);
      return [area, widgets] as const;
    })
  );
  const widgets: Record<string, CmsWidget[]> = {};
  for (const [area, areaWidgets] of widgetEntries) {
    if (areaWidgets.length > 0) {
      widgets[area] = areaWidgets;
    }
  }

  return {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    siteTitle: siteSettings.siteTitle || "",
    theme: themeSettings,
    site: {
      siteTitle: siteSettings.siteTitle,
      tagline: siteSettings.tagline,
      phone: siteSettings.phone,
      email: siteSettings.email,
      address: siteSettings.address,
      social: siteSettings.social,
      customCode: siteSettings.customCode,
    },
    menus,
    widgets,
  };
}

/**
 * Serialize the export to a formatted JSON string.
 */
export async function exportThemeJson(): Promise<string> {
  const data = await exportTheme();
  return JSON.stringify(data, null, 2);
}
