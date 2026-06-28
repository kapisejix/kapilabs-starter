/**
 * Kapi Theme Import — validate and apply theme configuration from JSON.
 *
 * Supports two modes:
 *   - "replace": overwrite all settings with imported values
 *   - "merge": merge imported values into existing settings
 */

import type { KapiThemeExport } from "./export";

export type ImportMode = "replace" | "merge";

export type ImportResult = {
  success: boolean;
  applied: number;
  skipped: number;
  errors: string[];
  warnings: string[];
};

/**
 * Validate a parsed theme export object.
 */
export function validateThemeExport(
  data: unknown
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== "object") {
    errors.push("Export data must be a JSON object");
    return { valid: false, errors };
  }

  const exportData = data as Record<string, unknown>;

  if (typeof exportData.schemaVersion !== "number") {
    errors.push("Missing or invalid schemaVersion");
  }

  if (typeof exportData.exportedAt !== "string") {
    errors.push("Missing or invalid exportedAt");
  }

  if (exportData.theme !== null && typeof exportData.theme !== "object") {
    errors.push("theme must be an object or null");
  }

  if (exportData.menus !== undefined && typeof exportData.menus !== "object") {
    errors.push("menus must be an object or undefined");
  }

  if (exportData.widgets !== undefined && typeof exportData.widgets !== "object") {
    errors.push("widgets must be an object or undefined");
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Dry-run an import — validate without applying.
 */
export function previewImport(
  data: KapiThemeExport,
  mode: ImportMode = "merge"
): ImportResult {
  const validation = validateThemeExport(data);

  if (!validation.valid) {
    return {
      success: false,
      applied: 0,
      skipped: 0,
      errors: validation.errors,
      warnings: [],
    };
  }

  const warnings: string[] = [];
  let applied = 0;
  let skipped = 0;

  // Count what would be applied
  if (data.theme) {
    applied++;
  } else {
    skipped++;
  }

  if (data.site) {
    applied++;
  } else {
    skipped++;
  }

  if (data.menus) {
    const menuCount = Object.keys(data.menus).length;
    applied += menuCount;
  }

  if (data.widgets) {
    const widgetCount = Object.keys(data.widgets).length;
    applied += widgetCount;
  }

  if (mode === "merge") {
    warnings.push("Using merge mode — existing settings not in the import will be preserved");
  }

  return {
    success: true,
    applied,
    skipped,
    errors: [],
    warnings,
  };
}

/**
 * Generate a human-readable summary of what would be imported.
 */
export function summarizeImport(
  data: KapiThemeExport
): string {
  const parts: string[] = [];

  if (data.theme) {
    parts.push("• Theme settings (colors, typography, layout)");
  }
  if (data.site) {
    parts.push("• Site settings (title, tagline, contact info)");
  }
  if (data.menus) {
    const menuCount = Object.keys(data.menus).length;
    parts.push(`• ${menuCount} menu(s)`);
  }
  if (data.widgets) {
    const widgetAreas = Object.keys(data.widgets);
    parts.push(`• Widgets in ${widgetAreas.length} area(s)`);
  }

  return [
    `Theme Export from "${data.siteTitle || "Unknown"}"`,
    `Created: ${data.exportedAt}`,
    `Schema Version: ${data.schemaVersion}`,
    "",
    "Contains:",
    ...parts,
  ].join("\n");
}

/**
 * Diff two theme exports and return the differences.
 * Useful for previewing changes before applying an import.
 */
export function diffThemeExports(
  current: KapiThemeExport,
  incoming: KapiThemeExport
): {
  changes: string[];
} {
  const changes: string[] = [];

  if (JSON.stringify(current.theme) !== JSON.stringify(incoming.theme)) {
    changes.push("Theme settings differ");
  }

  if (JSON.stringify(current.site) !== JSON.stringify(incoming.site)) {
    changes.push("Site settings differ");
  }

  // Check menu differences
  const currentMenuNames = Object.keys(current.menus || {});
  const incomingMenuNames = Object.keys(incoming.menus || {});
  for (const name of incomingMenuNames) {
    if (!currentMenuNames.includes(name)) {
      changes.push(`New menu: "${name}"`);
    } else if (
      JSON.stringify(current.menus?.[name]) !==
      JSON.stringify(incoming.menus?.[name])
    ) {
      changes.push(`Menu changed: "${name}"`);
    }
  }

  // Check widget differences
  const currentWidgetAreas = Object.keys(current.widgets || {});
  const incomingWidgetAreas = Object.keys(incoming.widgets || {});
  for (const area of incomingWidgetAreas) {
    if (!currentWidgetAreas.includes(area)) {
      changes.push(`New widgets in area: "${area}"`);
    } else if (
      JSON.stringify(current.widgets?.[area]) !==
      JSON.stringify(incoming.widgets?.[area])
    ) {
      changes.push(`Widgets changed in area: "${area}"`);
    }
  }

  return { changes };
}
