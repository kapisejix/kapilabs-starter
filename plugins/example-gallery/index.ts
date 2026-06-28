/**
 * Example Gallery Plugin — demonstrates the KapiLabs Plugin SDK.
 *
 * Features:
 * - Registers a "gallery" section type
 * - Registers a `kapi_gallery` shortcode
 * - Injects gallery-specific CSS variables
 */

import type { KapiPlugin } from "../../src/core/plugins/types";

const galleryPlugin: KapiPlugin = {
  name: "kapilabs-plugin-gallery",
  label: "Gallery Plugin",
  version: "1.0.0",
  description: "Image gallery section with lightbox support.",

  register(ctx) {
    // Register CSS variables for gallery styling
    ctx.registerCssVars({
      "--gallery-border-radius": "0.5rem",
      "--gallery-gap": "1rem",
      "--gallery-aspect-ratio": "4/3",
      "--gallery-overlay-bg": "rgba(0, 0, 0, 0.6)",
    });

    // Register a shortcode handler
    ctx.registerShortcode("kapi_gallery", (attrs) => {
      const images = (attrs.images || "").split(",").map((s: string) => s.trim()).filter(Boolean);
      const columns = attrs.columns || "3";
      const caption = attrs.caption || "";

      if (images.length === 0) {
        return '<div class="gallery-empty">No images provided.</div>';
      }

      let html = `<div class="kapi-gallery" style="display:grid;grid-template-columns:repeat(${columns},1fr);gap:var(--gallery-gap, 1rem);">`;

      for (const img of images) {
        html += `<div class="kapi-gallery-item" style="overflow:hidden;border-radius:var(--gallery-border-radius, 0.5rem);aspect-ratio:var(--gallery-aspect-ratio, 4/3);">`;
        html += `<img src="${escapeHtml(img)}" alt="${escapeHtml(caption)}" style="width:100%;height:100%;object-fit:cover;transition:transform 0.3s;cursor:pointer;" loading="lazy" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'" />`;
        html += `</div>`;
      }

      html += "</div>";
      return html;
    });
  },
};

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export default galleryPlugin;
