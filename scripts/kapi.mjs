#!/usr/bin/env node

/**
 * KapiLabs CLI — scaffolding and management tool.
 *
 * Usage:
 *   pnpm kapi generate child-theme <name>
 *   pnpm kapi generate plugin <name>
 *   pnpm kapi install <package>
 *   pnpm kapi search [query]
 *   pnpm kapi list [type]
 *   pnpm kapi help
 */

import { existsSync, mkdirSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// Lazy-load marketplace utilities (plain JS — no TypeScript dependency)
function loadMarketplace() {
  return import("./marketplace.mjs");
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args[0] === "help" || args[0] === "--help") {
    return cmdHelp();
  }

  const cmd = args.slice(0, 2).join(" ");
  if (cmd === "generate child-theme") {
    return cmdGenerateChildTheme(args[2]);
  }
  if (cmd === "generate plugin") {
    return cmdGeneratePlugin(args[2]);
  }
  if (cmd === "generate site") {
    return cmdGenerateSite(args[2]);
  }

  // Single-word commands
  switch (args[0]) {
    case "install":
      return cmdInstall(args[1], args[2]);
    case "search":
      return cmdSearch(args.slice(1).join(" "));
    case "list":
      return cmdList(args[1]);
    case "generate":
      console.error(`❌ Unknown generator: "${args[1]}".`);
      console.log('   Try: "pnpm kapi generate child-theme <name>"');
      console.log('   Try: "pnpm kapi generate plugin <name>"');
      console.log('   Try: "pnpm kapi generate site <key>"');
      process.exit(1);
    case "import-theme":
      return cmdImportTheme(args[1], args[2]);
    default:
      console.error(`❌ Unknown command: "${args.join(" ")}".`);
      cmdHelp();
      process.exit(1);
  }
}

// ─── Child Theme Generator ────────────────────────────────────────────────

function cmdGenerateChildTheme(name) {
  if (!name) {
    console.error("❌ Usage: pnpm kapi generate child-theme <name>");
    console.log("   Example: pnpm kapi generate child-theme business");
    process.exit(1);
  }

  const themeDir = resolve(ROOT, "src", "theme");
  const targetDir = resolve(themeDir);

  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }

  // Core directories to scaffold
  const dirs = [
    "components/navigation",
    "components/content",
    "components/widgets",
    "layouts",
    "sections/presets",
    "page-templates",
    "blog-templates",
    "seo",
    "styles",
    "theme",
    "shortcodes",
    "forms/storage",
    "cms",
  ];

  for (const d of dirs) {
    mkdirSync(resolve(targetDir, d), { recursive: true });
  }

  // Create a theme config file
  const themeConfigPath = resolve(targetDir, "theme-config.json");
  if (!existsSync(themeConfigPath)) {
    const config = {
      name,
      label: name.charAt(0).toUpperCase() + name.slice(1),
      version: "1.0.0",
      description: `KapiLabs child theme: ${name}`,
      author: "",
      parent: "kapilabs",
      overrides: [],
    };
    writeFileSync(themeConfigPath, JSON.stringify(config, null, 2) + "\n");
  }

  // Create a sample global.css if none exists
  const cssPath = resolve(targetDir, "styles", "global.css");
  if (!existsSync(cssPath)) {
    writeFileSync(
      cssPath,
      `/* ── ${name} Child Theme — Global Styles ── */\n` +
        `/* Edit this file to customize the look and feel of your ${name} site. */\n` +
        `/* The @kapi/ resolver loads this instead of src/core/styles/global.css */\n\n` +
        `/* Example: import a Google Font */\n` +
        `/* @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&display=swap'); */\n\n` +
        `/* Override theme CSS custom properties */\n` +
        `:root {\n` +
        `  /* --color-primary: #1a365d; */\n` +
        `  /* --font-heading: 'Inter', system-ui, sans-serif; */\n` +
        `}\n`
    );
  }

  // Create a sample ThemeVariables.astro override
  const varsDir = resolve(targetDir, "theme");
  if (!existsSync(resolve(varsDir, "ThemeVariables.astro"))) {
    writeFileSync(
      resolve(varsDir, "ThemeVariables.astro"),
      `---\n` +
        `// Override theme variables for ${name} child theme\n` +
        `// See src/core/theme/ThemeVariables.astro for all available vars\n` +
        `const { settings, page } = Astro.props;\n` +
        `---\n\n` +
        `<!-- This file overrides src/core/theme/ThemeVariables.astro -->\n` +
        `<!-- Copy the full content from core and edit here -->\n`
    );
  }

  // Create a sample override marker file for documentation
  const readmePath = resolve(targetDir, "README.md");
  if (!existsSync(readmePath)) {
    writeFileSync(
      readmePath,
      `# ${name.charAt(0).toUpperCase() + name.slice(1)} — KapiLabs Child Theme\n\n` +
        `## Overridden files\n\n` +
        `| File | Purpose |\n` +
        `|------|---------|\n` +
        `| \`styles/global.css\` | Global CSS overrides |\n` +
        `| \`theme/ThemeVariables.astro\` | CSS custom property overrides |\n\n` +
        `## Getting started\n\n` +
        `1. Edit \`src/theme/styles/global.css\` to customize styles\n` +
        `2. Add more overrides by copying files from \`src/core/\` to \`src/theme/\`\n` +
        `3. See \`src/theme/CUSTOMIZE.md\` for the full list of overridable files\n`
    );
  }

  console.log(`\n✅ Child theme "${name}" scaffolded successfully!`);
  console.log(`   Location: src/theme/`);
  console.log(`\n   Next steps:`);
  console.log(`   1. Edit src/theme/styles/global.css to customize styles`);
  console.log(`   2. Edit src/theme/theme/ThemeVariables.astro to override design tokens`);
  console.log(`   3. Copy files from src/core/ to src/theme/ to override specific components`);
  console.log(`   4. See src/theme/CUSTOMIZE.md for the full list of overridable files\n`);
}

// ─── Plugin Generator ────────────────────────────────────────────────────

function cmdGeneratePlugin(name) {
  if (!name) {
    console.error("❌ Usage: pnpm kapi generate plugin <name>");
    console.log("   Example: pnpm kapi generate plugin gallery");
    process.exit(1);
  }

  const pluginDir = resolve(ROOT, "plugins", name);

  if (existsSync(pluginDir)) {
    console.error(`❌ Plugin "${name}" already exists at plugins/${name}.`);
    process.exit(1);
  }

  mkdirSync(pluginDir, { recursive: true });

  const pluginName = `kapilabs-plugin-${name}`;
  const className = name
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");

  // index.ts — plugin entry point
  writeFileSync(
    resolve(pluginDir, "index.ts"),
    `import { definePlugin } from "@kapilabs/plugin-sdk";\n\n` +
      `export default definePlugin({\n` +
      `  name: "${pluginName}",\n` +
      `  label: "${className} Plugin",\n` +
      `  version: "1.0.0",\n` +
      `  description: "A KapiLabs plugin for ${className}",\n` +
      `  register(ctx) {\n` +
      `    // Register a section component\n` +
      `    // ctx.registerSection("${name}", YourSectionComponent);\n\n` +
      `    // Register a shortcode\n` +
      `    // ctx.registerShortcode("kapi_${name}", (attrs) => { return /* HTML */ });\n\n` +
      `    // Register a widget\n` +
      `    // ctx.registerWidget("${name}-widget", YourWidgetComponent);\n\n` +
      `    // Register CSS variables\n` +
      `    // ctx.registerCssVars({ "--${name}-color": "#6366f1" });\n` +
      `  },\n` +
      `});\n`
  );

  // plugin.json — manifest
  writeFileSync(
    resolve(pluginDir, "plugin.json"),
    JSON.stringify(
      {
        name: pluginName,
        label: `${className} Plugin`,
        version: "1.0.0",
        description: `A KapiLabs plugin for ${className}`,
        author: "",
        dependencies: [],
        kapilabs: ">=2.0.0",
      },
      null,
      2
    ) + "\n"
  );

  // README
  writeFileSync(
    resolve(pluginDir, "README.md"),
    `# ${className} Plugin\n\n` +
      `A KapiLabs plugin for ${className}.\n\n` +
      `## Installation\n\n` +
      `Add to \`PUBLIC_KAPI_PLUGINS\` env var:\n\`\`\`\n` +
      `PUBLIC_KAPI_PLUGINS=${pluginName}\n\`\`\`\n\n` +
      `## Features\n\n` +
      `- TODO\n`
  );

  console.log(`\n✅ Plugin "${name}" scaffolded successfully!`);
  console.log(`   Location: plugins/${name}/`);
  console.log(`\n   Next steps:`);
  console.log(`   1. Edit plugins/${name}/index.ts to implement plugin functionality`);
  console.log(`   2. Add the plugin to src/core/plugins/loader.ts`);
  console.log(`   3. Enable via PUBLIC_KAPI_PLUGINS env var\n`);
}

// ─── Site Generator (Multi-site) ──────────────────────────────────────

function cmdGenerateSite(key) {
  if (!key) {
    console.error("❌ Usage: pnpm kapi generate site <site-key>");
    console.log("   Example: pnpm kapi generate site client-a");
    process.exit(1);
  }

  const siteName = key.charAt(0).toUpperCase() + key.slice(1).replace(/-/g, " ");
  const envPrefix = key.toUpperCase().replace(/-/g, "_") + "_";

  // Build JSON config that should be set as the KAPI_MULTISITE_SITES env var
  const siteConfig = {
    name: siteName,
    key: key,
    hostnames: [`${key}.localhost`, `${key}.example.com`],
    defaultHostname: `${key}.localhost`,
    cms: {
      backend: "sanity",
      envPrefix: envPrefix,
    },
    theme: {
      name: key,
    },
  };

  console.log(`\n✅ Site configuration generated for "${key}"!`);
  console.log(`   Name: ${siteName}`);
  console.log(`   Env prefix: ${envPrefix}`);
  console.log(`\n   To enable this site, set the following environment variable:`);
  console.log(`\n   KAPI_MULTISITE_SITES='[${JSON.stringify(siteConfig, null, 2)}]'`);
  console.log(`\n   Then set the following env vars with prefix ${envPrefix}:`);
  console.log(`      - ${envPrefix}PUBLIC_SANITY_PROJECT_ID`);
  console.log(`      - ${envPrefix}PUBLIC_SANITY_DATASET`);
  console.log(`      - ${envPrefix}SANITY_TOKEN`);
  console.log(`   3. Update hostnames and other config as needed`);
  console.log(`   4. Restart the dev server to reflect changes\n`);
}
// ─── Theme Import ─────────────────────────────────────────────────────

async function cmdImportTheme(filePath, flag) {
  if (!filePath || filePath === "--help" || filePath === "-h") {
    console.log("Usage: pnpm kapi import-theme <file.json> [--mode=merge|replace]");
    console.log("  Validates and applies a theme export JSON file.");
    console.log("  Requires the dev server to be running on http://localhost:4321");
    console.log("  Example: pnpm kapi import-theme theme-export-2025-01-01.json");
    process.exit(filePath ? 0 : 1);
  }

  const { existsSync: exists, readFileSync: readFile } = await import("fs");

  if (!exists(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }

  let json;
  try {
    json = JSON.parse(readFile(filePath, "utf-8"));
  } catch (err) {
    console.error(`❌ Invalid JSON: ${err.message}`);
    process.exit(1);
  }

  const mode = flag?.startsWith("--mode=") ? flag.slice(7) : "merge";
  const adminKey = process.env.FORM_ADMIN_KEY || "";

  if (!adminKey) {
    console.error("❌ FORM_ADMIN_KEY is not set. Set it in .env or as an environment variable.");
    process.exit(1);
  }

  const baseUrl = process.env.SITE_URL || "http://localhost:4321";

  console.log(`\n🎨 Importing theme from ${filePath} (mode: ${mode})...`);

  try {
    const res = await fetch(`${baseUrl}/admin/theme-import.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": adminKey,
      },
      body: JSON.stringify({ theme: json, mode }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      console.error(`\n❌ Import validation failed:`);
      console.error(JSON.stringify(data.errors ?? data, null, 2));
      process.exit(1);
    }

    console.log(`\n✅ Theme import validated successfully (mode: ${mode})`);
    console.log(`   ${data.summary ?? ""}`)
    console.log(`   Applied: ${data.applied?.length ?? 0} settings`);
    if (data.warnings?.length) {
      for (const w of data.warnings) console.warn(`   ⚠  ${w}`);
    }
    console.log(`\n   Note: This validates the import. To apply changes, use the Admin UI at /admin/theme\n`);
  } catch (err) {
    console.error(`\n❌ Request failed: ${err.message}`);
    console.error("   Make sure the dev server is running: pnpm dev");
    process.exit(1);
  }
}


// ─── Marketplace — Install ───────────────────────────────────────────

async function cmdInstall(name, flag) {
  if (!name || name === "--help" || name === "-h") {
    console.log("Usage: pnpm kapi install <package-name> [--force]");
    console.log("  Example: pnpm kapi install kapilabs-theme-business");
    console.log("  Example: pnpm kapi install gallery  (short name works)");
    process.exit(name ? 0 : 1);
  }

  const force = flag === "--force" || flag === "-f";

  try {
    const m = await loadMarketplace();

    console.log(`\n🔍 Searching for package "${name}"...`);

    const pkg = m.findPackage(name);
    if (!pkg) {
      console.error(`❌ Package "${name}" not found in registry.`);
      console.log(`   Try: pnpm kapi search ${name}`);
      process.exit(1);
    }

    console.log(`\n📦 Package found:`);
    console.log(m.formatPackage(pkg));

    // Security scan
    console.log(`\n🔒 Running security scan...`);
    const scan = m.scanPackage(pkg);
    console.log(m.formatSecurityResult(scan));

    if (!scan.passed && !force) {
      console.error(`\n❌ Security scan failed. Use --force to install anyway.`);
      process.exit(1);
    }

    // Install
    console.log(`\n📥 Installing...`);
    const result = m.installPackage(name);

    if (result.success) {
      console.log(`\n✅ ${result.message}`);
      if (result.warnings && result.warnings.length > 0) {
        console.log(`\n⚠  Warnings:`);
        for (const w of result.warnings) console.log(`   ${w}`);
      }
      console.log(`\n   Type: ${result.packageType}`);
      console.log(`   Path: ${result.targetPath}`);
    } else {
      console.error(`\n❌ ${result.message}`);
      if (result.errors) {
        for (const e of result.errors) console.error(`   ${e}`);
      }
      process.exit(1);
    }
  } catch (err) {
    console.error(`❌ Install failed: ${err.message || err}`);
    process.exit(1);
  }
}

// ─── Marketplace — Search ────────────────────────────────────────────

async function cmdSearch(query) {
  const m = await loadMarketplace();

  console.log(`\n🔍 Searching for "${query || "all"}"...`);

  const result = m.listPackages({
    search: query || undefined,
    limit: 20,
    sort: "downloads",
    order: "desc",
  });

  if (result.packages.length === 0) {
    console.log(`\n  No packages found.`);
    process.exit(0);
  }

  console.log(`\n  Found ${result.total} package(s):\n`);
  for (const pkg of result.packages) {
    console.log(m.formatPackage(pkg));
    console.log("");
  }
  console.log(`  ---`);
  console.log(`  To install: pnpm kapi install <package-name>`);
}

// ─── Marketplace — List ─────────────────────────────────────────────

// Map user-friendly type names to canonical package types
const TYPE_ALIASES = {
  "themes": "child-theme",
  "theme": "child-theme",
  "child-themes": "child-theme",
  "plugins": "plugin",
  "section-packs": "section-pack",
  "widget-packs": "widget-pack",
  "starters": "starter",
  "blueprints": "blueprint",
};

async function cmdList(type) {
  const m = await loadMarketplace();

  if (type) {
    // Map user-friendly type names
    const canonicalType = TYPE_ALIASES[type] || type;
    const result = m.listPackages({
      type: canonicalType,
      limit: 50,
      sort: "downloads",
      order: "desc",
    });

    if (result.packages.length === 0) {
      console.log(`\n  No packages of type "${canonicalType}" found.`);
      process.exit(0);
    }

    console.log(`\n  ${result.total} ${canonicalType} package(s):\n`);
    for (const pkg of result.packages) {
      console.log(m.formatPackage(pkg));
      console.log("");
    }
  } else {
    // Show categories
    const categories = m.getPackageCategories();
    console.log(`\n📦 Available package types:\n`);
    for (const cat of categories) {
      console.log(`  ${cat.type.padEnd(16)} ${cat.count} package(s)`);
    }
    console.log(`\n  To list packages of a type: pnpm kapi list <type>`);
  }
}

// ─── Help ────────────────────────────────────────────────────────────────

function cmdHelp() {
  console.log(`
╔══════════════════════════════════════════╗
║        KapiLabs CLI Tool v1.0           ║
╚══════════════════════════════════════════╝

Usage:  pnpm kapi <command> [options]

Commands:

  generate child-theme <name>   Scaffold a child theme in src/theme/
  generate plugin <name>        Scaffold a new plugin in plugins/<name>/
  generate site <key>           Add a site to kapilabs.config.ts
  install <package> [--force]   Install a package from the marketplace
  search [query]                Search the marketplace registry
  list [type]                   List packages by type, or show categories
  import-theme <file>           Import and validate a theme JSON export
  help                          Show this help message

Examples:

  pnpm kapi generate child-theme business
  pnpm kapi generate plugin gallery
  pnpm kapi generate site client-a
  pnpm kapi install kapilabs-theme-business
  pnpm kapi install gallery
  pnpm kapi search gallery
  pnpm kapi list child-theme
  pnpm kapi list
`);
}

main();
