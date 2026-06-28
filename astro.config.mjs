import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { existsSync, readdirSync, statSync } from "fs";
import { resolve } from "path";

const EXTENSIONS = [".ts", ".js", ".astro", ".tsx", ".jsx"];

function findFile(base, rel) {
  const full = resolve(process.cwd(), base, rel);
  if (existsSync(full) && !statSync(full).isDirectory()) return full;
  for (const ext of EXTENSIONS) {
    if (existsSync(full + ext)) return full + ext;
  }
  for (const ext of EXTENSIONS) {
    const idx = resolve(full, "index" + ext);
    if (existsSync(idx)) return idx;
  }
  return null;
}

const kapiThemeResolver = {
  name: "kapilabs-theme-resolver",
  resolveId(id) {
    if (!id.startsWith("@kapi/")) return null;
    const rel = id.slice("@kapi/".length);
    return findFile("src/theme", rel) || findFile("src/core", rel) || null;
  },
};

/**
 * Build-time validation: warn if a file in src/theme/ has no matching
 * file in src/core/. This catches orphaned override files that would
 * silently have no effect after a core file is renamed or removed.
 */
const kapiThemeValidator = {
  name: "kapilabs-theme-validator",
  buildStart() {
    const themeDir = "src/theme";
    const coreDir = "src/core";

    function walk(dir, relativePath = "") {
      let entries;
      try {
        entries = readdirSync(dir, { withFileTypes: true });
      } catch {
        return;
      }

      for (const entry of entries) {
        if (entry.name.startsWith(".")) continue;
        const fullPath = resolve(dir, entry.name);
        const relPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;

        if (entry.isDirectory()) {
          walk(fullPath, relPath);
        } else if (entry.isFile()) {
          const matchPath = resolve(coreDir, relPath);

          // Check if a matching file exists in src/core
          let found = false;

          // First check the exact path (file already has an extension)
          if (existsSync(matchPath) && !statSync(matchPath).isDirectory()) {
            found = true;
          }

          if (!found) {
            for (const ext of [".astro", ".ts", ".js", ".tsx", ".jsx", ".css", ".mjs", ".json"]) {
              if (existsSync(matchPath + ext)) {
                found = true;
                break;
              }
              // Check index files
              const indexFile = resolve(matchPath, "index" + ext);
              if (existsSync(indexFile)) {
                found = true;
                break;
              }
            }
          }

          if (!found &&
              entry.name !== ".gitkeep" &&
              entry.name !== "CUSTOMIZE.md" &&
              entry.name !== "README.md" &&
              entry.name !== "theme-config.json") {
            console.warn(
              `\x1b[33m⚠ [KapiLabs] Theme override has no matching core file: src/theme/${relPath}\n` +
              `  The file at src/core/${relPath} does not exist. This override will have no effect.\x1b[0m`
            );
          }
        }
      }
    }

    if (existsSync(themeDir)) {
      walk(themeDir);
    }
  },
};

export default defineConfig({
  site: process.env.SITE_URL || "https://localhost:4321",
  output: "server",
  compressHTML: true,
  adapter: cloudflare({
    mode: "directory",
    runtime: "local",
  }),
  integrations: [react()],
  vite: {
    plugins: [tailwindcss(), kapiThemeResolver, kapiThemeValidator],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Bundle Sanity client separately — it's large and rarely changes
            if (id.includes("@sanity/client")) return "sanity";
            // Bundle vendor dependencies into a shared chunk
            if (id.includes("node_modules")) {
              if (id.includes("astro")) return "astro-vendor";
              return "vendor";
            }
          },
        },
      },
    },
  },
});
