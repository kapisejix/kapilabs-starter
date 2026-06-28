import type { SectionSettings, DisplayPreset } from "@kapi/cms/types";

/**
 * Build a CSS custom properties string from section settings.
 * These are injected as inline style on the section wrapper element.
 */
export function sectionCssVars(settings?: SectionSettings): string {
  if (!settings) return "";

  const vars: string[] = [];

  if (settings.columns) vars.push(`--section-columns: ${settings.columns}`);
  if (settings.rows) vars.push(`--section-rows: ${settings.rows}`);
  if (settings.spacing) vars.push(`--section-gap: ${settings.spacing}`);
  if (settings.containerWidth) vars.push(`--section-max-width: ${settings.containerWidth}`);
  if (settings.background) vars.push(`--section-bg: ${settings.background}`);
  if (settings.padding) vars.push(`--section-padding: ${settings.padding}`);
  if (settings.alignment) vars.push(`--section-align: ${settings.alignment}`);
  if (settings.borderRadius) vars.push(`--section-radius: ${settings.borderRadius}`);
  if (settings.shadow) vars.push(`--section-shadow: ${settings.shadow}`);
  if (settings.overlay) vars.push(`--section-overlay: ${settings.overlay}`);
  if (settings.cssClass) vars.push(`--section-css-class: ${settings.cssClass}`);

  // Animation
  if (settings.animation && settings.animation !== "none") {
    vars.push(`--section-animate: ${animationCss(settings.animation)}`);
  }

  return vars.join("; ");
}

/**
 * Map animation name to CSS animation value.
 */
function animationCss(animation: string): string {
  const map: Record<string, string> = {
    fadeIn: "animation: kapi-fade-in 0.6s ease-out",
    fadeInUp: "animation: kapi-fade-in-up 0.6s ease-out",
    fadeInDown: "animation: kapi-fade-in-down 0.6s ease-out",
    slideInLeft: "animation: kapi-slide-in-left 0.6s ease-out",
    slideInRight: "animation: kapi-slide-in-right 0.6s ease-out",
    zoomIn: "animation: kapi-zoom-in 0.5s ease-out",
  };
  return map[animation] || "";
}

/**
 * Get the CSS grid template columns value for a display preset and column count.
 */
export function presetGridTemplate(
  preset?: DisplayPreset,
  columns?: number
): string {
  const cols = columns || 3;

  switch (preset) {
    case "list":
      return "1fr";
    case "masonry":
      // CSS columns layout handled separately
      return "";
    case "carousel":
    case "slider":
    case "scroll":
      return `repeat(${cols}, minmax(280px, 1fr))`;
    case "cards":
    case "grid":
    default:
      return `repeat(${cols}, 1fr)`;
  }
}

/**
 * Get the CSS class name for a display preset.
 */
export function presetCssClass(preset?: DisplayPreset): string {
  if (!preset) return "preset-grid";
  return `preset-${preset}`;
}

/**
 * Get the item wrapper class for a display preset.
 */
export function presetItemClass(preset?: DisplayPreset): string {
  if (!preset) return "preset-item";
  return `preset-item preset-${preset}-item`;
}

/**
 * Animation keyframes injected globally.
 */
export const sectionAnimationStyles = `
  @keyframes kapi-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes kapi-fade-in-up {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes kapi-fade-in-down {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes kapi-slide-in-left {
    from { opacity: 0; transform: translateX(-30px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes kapi-slide-in-right {
    from { opacity: 0; transform: translateX(30px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes kapi-zoom-in {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }
`;
