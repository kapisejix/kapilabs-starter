# @kapilabs/plugin-sdk

Public API types and utilities for building KapiLabs plugins.

## Installation

```bash
pnpm add @kapilabs/plugin-sdk
```

## Usage

```typescript
import { definePlugin } from "@kapilabs/plugin-sdk";
import type { KapiPlugin, PluginContext } from "@kapilabs/plugin-sdk";

const myPlugin: KapiPlugin = definePlugin({
  name: "kapilabs-plugin-myplugin",
  label: "My Plugin",
  version: "1.0.0",
  description: "Does something awesome",

  register(ctx: PluginContext) {
    // Register a section
    ctx.registerSection("my-section", MySectionComponent);

    // Register a shortcode
    ctx.registerShortcode("kapi_myfeature", (attrs) => {
      return `<div>Hello from ${attrs.name || "world"}!</div>`;
    });

    // Register CSS variables
    ctx.registerCssVars({
      "--myplugin-color": "#6366f1",
    });
  },
});

export default myPlugin;
```

## Enabling a plugin

1. Add your plugin to `src/core/plugins/loader.ts`:
   ```typescript
   "kapilabs-plugin-myplugin": () => import("../../plugins/myplugin/index.ts"),
   ```

2. Set the env var:
   ```
   PUBLIC_KAPI_PLUGINS=kapilabs-plugin-myplugin
   ```

## Available hooks

| Method | Purpose |
|--------|---------|
| `registerSection(type, component)` | Add a new section type to the page builder |
| `registerShortcode(name, handler)` | Add a `[kapi_*]` shortcode |
| `registerWidget(type, component)` | Add a new widget type |
| `registerRoute(path, component)` | Add an Astro page route |
| `registerAdapterMethod(name, fn)` | Override a CMS adapter method |
| `registerSchemaBuilder(name, builder)` | Add JSON-LD schema types |
| `registerCssVars(vars)` | Inject CSS custom properties |
| `registerGlobalSection(key, section)` | Register a global section |
