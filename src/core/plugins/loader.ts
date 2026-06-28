import { pluginRegistry } from "./registry";
import type { KapiPlugin } from "./types";

export type PluginConfig = {
  /** Enable/disable specific plugins by name */
  plugins?: {
    enabled?: string[];
  };
};

/**
 * Plugin discovery map.
 * When a plugin is in the enabled list, import it and register it.
 */
const PLUGIN_IMPORTS: Record<string, () => Promise<{ default: KapiPlugin }>> = {
  "kapilabs-plugin-seo": () => import("../../plugins/seo/index.ts"),
  "kapilabs-plugin-forms": () => import("../../plugins/forms/index.ts"),
  "kapilabs-plugin-blog": () => import("../../plugins/blog/index.ts"),
  "kapilabs-plugin-testimonials": () => import("../../plugins/testimonials/index.ts"),
  "kapilabs-plugin-gallery": () => import("../../../plugins/example-gallery/index.ts"),
};

/**
 * Load and register plugins based on configuration.
 * Each plugin module should export a default KapiPlugin object.
 */
export async function loadPlugins(config?: PluginConfig): Promise<void> {
  const enabledList = config?.plugins?.enabled;

  if (!enabledList || enabledList.length === 0) {
    // No plugins configured — init the registry so any
    // programmatically registered plugins (via usePlugin) get enabled.
    pluginRegistry.init();
    return;
  }

  for (const name of enabledList) {
    const importer = PLUGIN_IMPORTS[name];
    if (!importer) {
      console.warn(`[KapiPlugin] Unknown plugin "${name}" — not in plugin map.`);
      continue;
    }

    try {
      const mod = await importer();
      pluginRegistry.register(mod.default);
    } catch (err) {
      console.error(`[KapiPlugin] Failed to load plugin "${name}":`, err);
    }
  }

  // Initialize the registry — enables all registered plugins
  pluginRegistry.init();

  const all = pluginRegistry.getAll();
  console.log(
    `[KapiPlugin] Loaded ${pluginRegistry.getEnabled().length}/${all.length} plugins`
  );
}

/**
 * Create a plugin configuration from environment variables.
 * Expected format: PUBLIC_KAPI_PLUGINS=kapilabs-plugin-seo,kapilabs-plugin-forms
 */
export function pluginConfigFromEnv(): PluginConfig {
  const raw =
    typeof import.meta !== "undefined"
      ? (import.meta as Record<string, any>).env?.PUBLIC_KAPI_PLUGINS
      : undefined;

  if (!raw) return {};

  return {
    plugins: {
      enabled: raw
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean),
    },
  };
}
