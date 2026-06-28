import type { KapiLayout, KapiLayoutConfig } from "./types";
import { defaultLayout, defaultLayoutConfig } from "./types";

const LAYOUTS: KapiLayout[] = [
  "content-sidebar",
  "sidebar-content",
  "content-sidebar-sidebar",
  "sidebar-sidebar-content",
  "sidebar-content-sidebar",
  "full-width-content",
  "blank",
  "centered",
];

/**
 * Resolve a layout string to a valid KapiLayout, with optional config overrides.
 */
export function resolveLayout(layout?: string): KapiLayout {
  return LAYOUTS.includes(layout as KapiLayout)
    ? (layout as KapiLayout)
    : defaultLayout;
}

/**
 * Resolve a layout string to a full KapiLayoutConfig object with defaults merged.
 */
export function resolveLayoutConfig(layout?: string, overrides?: Partial<KapiLayoutConfig>): KapiLayoutConfig {
  const validated = resolveLayout(layout);
  return {
    ...defaultLayoutConfig,
    ...overrides,
    layout: validated,
  };
}

