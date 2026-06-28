import type { KapiPlugin, PluginContext } from "./types";

type PluginEntry = {
  plugin: KapiPlugin;
  enabled: boolean;
};

/**
 * PluginRegistry — central registry for all plugins.
 * Manages lifecycle: register → enable → register hooks.
 */
class PluginRegistry {
  private plugins = new Map<string, PluginEntry>();
  private initQueue: KapiPlugin[] = [];
  private initialized = false;

  /** Registered section components */
  sections = new Map<string, any>();

  /** Registered shortcode handlers */
  shortcodes = new Map<string, (attrs: Record<string, string>) => string>();

  /** Registered widget components */
  widgets = new Map<string, any>();

  /** Registered Astro page routes */
  routes = new Map<string, any>();

  /** Registered CMS adapter method overrides */
  adapterMethods = new Map<string, Function>();

  /** Registered schema.org JSON-LD builders */
  schemaBuilders = new Map<string, (...args: any[]) => Record<string, unknown>>();

  /** Registered custom CSS variables */
  cssVars = new Map<string, string>();

  /** Registered global sections */
  globalSections = new Map<string, any>();

  /**
   * Register a plugin. If the system is already initialized,
   * the plugin is registered and enabled immediately.
   */
  register(plugin: KapiPlugin): void {
    if (this.plugins.has(plugin.name)) {
      console.warn(`[KapiPlugin] Plugin "${plugin.name}" is already registered. Skipping.`);
      return;
    }

    const entry: PluginEntry = { plugin, enabled: false };
    this.plugins.set(plugin.name, entry);

    if (this.initialized) {
      this.enable(plugin.name);
    } else {
      this.initQueue.push(plugin);
    }
  }

  /**
   * Enable a previously registered plugin by name.
   * Checks dependencies first.
   */
  enable(name: string): boolean {
    const entry = this.plugins.get(name);
    if (!entry) {
      console.warn(`[KapiPlugin] Cannot enable unknown plugin "${name}".`);
      return false;
    }
    if (entry.enabled) return true;

    // Resolve dependencies
    const deps = entry.plugin.dependencies || [];
    for (const dep of deps) {
      if (!this.enable(dep)) {
        console.warn(
          `[KapiPlugin] Cannot enable "${name}": dependency "${dep}" failed to enable.`
        );
        return false;
      }
    }

    // Create the plugin context and call register
    const ctx = this.createContext();

    try {
      entry.plugin.register(ctx);

      // Call afterRegister hook if present
      if (entry.plugin.afterRegister) {
        entry.plugin.afterRegister(ctx);
      }

      entry.enabled = true;
      console.log(`[KapiPlugin] Enabled: "${name}" v${entry.plugin.version}`);
    } catch (err) {
      console.error(`[KapiPlugin] Failed to enable plugin "${name}":`, err);
      return false;
    }
    return true;
  }

  /**
   * Disable a plugin by name.
   */
  disable(name: string): void {
    const entry = this.plugins.get(name);
    if (!entry || !entry.enabled) return;

    // TODO: clean up registered hooks from this plugin
    entry.enabled = false;
    console.log(`[KapiPlugin] Disabled: "${name}"`);
  }

  /**
   * Initialize all queued plugins.
   * Called once at build time.
   */
  init(): void {
    if (this.initialized) return;
    this.initialized = true;

    for (const plugin of this.initQueue) {
      this.enable(plugin.name);
    }

    console.log(`[KapiPlugin] Initialized: ${this.getEnabled().length} plugins active`);
  }

  /**
   * Get a list of all registered plugins.
   */
  getAll(): KapiPlugin[] {
    return Array.from(this.plugins.values()).map((e) => e.plugin);
  }

  /**
   * Get all enabled plugins.
   */
  getEnabled(): KapiPlugin[] {
    return Array.from(this.plugins.values())
      .filter((e) => e.enabled)
      .map((e) => e.plugin);
  }

  /**
   * Check if a plugin is enabled.
   */
  isEnabled(name: string): boolean {
    return this.plugins.get(name)?.enabled ?? false;
  }

  /**
   * Create a PluginContext bound to this registry instance.
   */
  private createContext(): PluginContext {
    const registry = this;

    return {
      registerSection(type, component) {
        registry.sections.set(type, component);
      },

      registerShortcode(name, handler) {
        registry.shortcodes.set(name, handler);
      },

      registerWidget(type, component) {
        registry.widgets.set(type, component);
      },

      registerRoute(path, component) {
        registry.routes.set(path, component);
      },

      registerAdapterMethod(name, fn) {
        registry.adapterMethods.set(name as string, fn);
      },

      registerSchemaBuilder(name, builder) {
        registry.schemaBuilders.set(name, builder);
      },

      registerCssVars(vars) {
        for (const [key, value] of Object.entries(vars)) {
          registry.cssVars.set(key, value);
        }
      },

      registerGlobalSection(key, section) {
        registry.globalSections.set(key, section);
      },

      registry: {
        getSections: () => Array.from(registry.sections.keys()),
        getShortcodes: () => Array.from(registry.shortcodes.keys()),
        getWidgets: () => Array.from(registry.widgets.keys()),
        getRoutes: () => Array.from(registry.routes.keys()),
        getSchemaBuilders: () => Array.from(registry.schemaBuilders.keys()),
      },
    };
  }
}

/** Singleton instance */
export const pluginRegistry = new PluginRegistry();

/**
 * Convenience: register + auto-enable a plugin.
 */
export function usePlugin(plugin: KapiPlugin): void {
  pluginRegistry.register(plugin);
}
