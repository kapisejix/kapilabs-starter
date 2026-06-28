import type { NormalizedSection } from "@kapi/cms/types";

/**
 * PluginContext provides the plugin with hooks to register extensions
 * into the KapiLabs framework at build/SSR time.
 */
export type PluginContext = {
  /** Register a section component for a given section type */
  registerSection: (type: string, component: any) => void;

  /** Register a shortcode handler */
  registerShortcode: (name: string, handler: (attrs: Record<string, string>) => string) => void;

  /** Register a widget component for a given widget type */
  registerWidget: (type: string, component: any) => void;

  /** Register an Astro page route (path → component) */
  registerRoute: (path: string, component: any) => void;

  /** Register a CMS adapter method override */
  registerAdapterMethod: <K extends keyof import("@kapi/cms/types").CmsAdapter>(
    name: K,
    fn: import("@kapi/cms/types").CmsAdapter[K]
  ) => void;

  /** Register a JSON-LD / schema.org type builder */
  registerSchemaBuilder: (name: string, builder: (...args: any[]) => Record<string, unknown>) => void;

  /** Register a custom CSS variable set injected by the plugin */
  registerCssVars: (vars: Record<string, string>) => void;

  /** Register a global section type that can be placed in widget areas */
  registerGlobalSection: (key: string, section: NormalizedSection) => void;

  /** Access the plugin registry metadata */
  registry: {
    getSections: () => string[];
    getShortcodes: () => string[];
    getWidgets: () => string[];
    getRoutes: () => string[];
    getSchemaBuilders: () => string[];
  };
};

/**
 * KapiPlugin — the interface every plugin must export as its default.
 */
export type KapiPlugin = {
  /** Unique plugin identifier (e.g. "kapilabs-plugin-seo") */
  name: string;

  /** Human-readable label */
  label?: string;

  /** Semver string */
  version: string;

  /** Plugin description */
  description?: string;

  /** Array of plugin names this depends on */
  dependencies?: string[];

  /** Called once at build time. The plugin registers all its hooks here. */
  register: (ctx: PluginContext) => void;

  /** Optional: called after all plugins have registered, for cross-plugin coordination */
  afterRegister?: (ctx: PluginContext) => void;
};
